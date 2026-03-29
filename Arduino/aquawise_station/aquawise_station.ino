/*
 * Aquawise Station — HTTP POST to Django ingest endpoint
 *
 * Board  : ESP32 (or ESP8266 — change WiFi.h to ESP8266WiFi.h)
 * Library: ArduinoJson  (install via Library Manager: "ArduinoJson" by Benoit Blanchon)
 *
 * Usage:
 *   1. Set WIFI_SSID, WIFI_PASSWORD, SERVER_IP, STATION_NAME below.
 *   2. Flash to the board and open Serial Monitor at 115200 baud.
 *   3. If the preset WiFi doesn't connect within 5 s, a scan runs and you
 *      pick a network by number and enter the password via Serial.
 *   4. Follow the sensor prompts — enter each value, press Enter.
 *   5. The sketch packages the values as JSON and POSTs to /api/ingest/.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ── Configuration ────────────────────────────────────────────────────────────
const char* WIFI_SSID     = "Javis";
const char* WIFI_PASSWORD = "777ascii";

// IP address of the machine running Django (e.g. your laptop on the same network)
const char* SERVER_IP   = "192.168.0.108";
const int   SERVER_PORT = 8000;

// Must match a WaterSource name in the database exactly (case-insensitive)
const char* STATION_NAME = "Dunga Beach Station";
// ─────────────────────────────────────────────────────────────────────────────

String serverUrl;

// ── Helpers ───────────────────────────────────────────────────────────────────

// Block until a full line arrives on Serial, then return it trimmed.
String readLine() {
  while (!Serial.available()) { delay(10); }
  String s = Serial.readStringUntil('\n');
  s.trim();
  return s;
}

// Read a float from Serial, blocking until the user hits Enter.
float promptFloat(const char* label, const char* unit) {
  Serial.print("  ");
  Serial.print(label);
  Serial.print(" (");
  Serial.print(unit);
  Serial.print("): ");
  float value = readLine().toFloat();
  Serial.println(value);
  return value;
}

// ── WiFi ──────────────────────────────────────────────────────────────────────

// Scan networks, print numbered list, return count.
int scanAndPrint() {
  Serial.println("\nScanning for WiFi networks...");
  int n = WiFi.scanNetworks();
  if (n == 0) {
    Serial.println("No networks found.");
    return 0;
  }
  Serial.println("Available networks:");
  for (int i = 0; i < n; i++) {
    Serial.print("  [");
    Serial.print(i + 1);
    Serial.print("] ");
    Serial.print(WiFi.SSID(i));
    Serial.print("  (RSSI: ");
    Serial.print(WiFi.RSSI(i));
    Serial.print(" dBm)");
    if (WiFi.encryptionType(i) == WIFI_AUTH_OPEN) {
      Serial.print("  [open]");
    }
    Serial.println();
  }
  return n;
}

// Interactive WiFi picker — shown when the preset credentials fail.
void pickWifi() {
  int n = scanAndPrint();
  if (n == 0) {
    Serial.println("Retrying scan in 5 s...");
    delay(5000);
    n = scanAndPrint();
    if (n == 0) return;
  }

  // Pick network
  int choice = 0;
  while (choice < 1 || choice > n) {
    Serial.print("\nSelect network [1-");
    Serial.print(n);
    Serial.print("]: ");
    choice = readLine().toInt();
    if (choice < 1 || choice > n) {
      Serial.println("Invalid selection, try again.");
    }
  }
  String chosenSSID = WiFi.SSID(choice - 1);
  Serial.println(chosenSSID);

  // Enter password (leave blank for open networks)
  Serial.print("Password (leave blank if open): ");
  String password = readLine();

  Serial.print("Connecting to ");
  Serial.print(chosenSSID);
  Serial.print("...");

  WiFi.begin(chosenSSID.c_str(), password.c_str());

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected!");
  } else {
    Serial.println("\nFailed to connect. Will retry on next loop.");
  }
}

// Try the preset credentials for up to 5 s; fall back to interactive picker.
void connectWifi() {
  Serial.print("Connecting to preset WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 5000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected to preset network.");
  } else {
    Serial.println("\nPreset network not reachable.");
    WiFi.disconnect(true);
    delay(500);
    pickWifi();
  }
}

// ── Setup ─────────────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  delay(1000);

  serverUrl = String("http://") + SERVER_IP + ":" + SERVER_PORT + "/api/ingest/";

  Serial.println("\n=== Aquawise Station ===");
  connectWifi();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Sending to: ");
    Serial.println(serverUrl);
  }
  Serial.println("========================\n");
}

// ── Loop ──────────────────────────────────────────────────────────────────────

void loop() {
  // Re-connect if dropped
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost. Reconnecting...");
    WiFi.disconnect(true);
    delay(500);
    connectWifi();
    return;
  }

  Serial.println("--- Enter sensor readings ---");

  float temperature     = promptFloat("Temperature",      "C");
  float turbidity       = promptFloat("Turbidity",        "NTU");
  float ph              = promptFloat("pH",               "pH");
  float dissolvedOxygen = promptFloat("Dissolved Oxygen", "mg/L");
  float conductivity    = promptFloat("Conductivity",     "uS/cm");
  float nitrates        = promptFloat("Nitrates",         "mg/L");

  // Build JSON payload
  StaticJsonDocument<256> doc;
  doc["station"]          = STATION_NAME;
  doc["temperature"]      = temperature;
  doc["turbidity"]        = turbidity;
  doc["ph"]               = ph;
  doc["dissolved_oxygen"] = dissolvedOxygen;
  doc["conductivity"]     = conductivity;
  doc["nitrates"]         = nitrates;

  String payload;
  serializeJson(doc, payload);

  Serial.println("\nSending payload:");
  Serial.println(payload);

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.print("HTTP status: ");
    Serial.println(httpCode);
    Serial.print("Response:    ");
    Serial.println(http.getString());
  } else {
    Serial.print("HTTP error: ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
  Serial.println("\n--- Reading sent. Ready for next. ---\n");

  delay(1000);
}
