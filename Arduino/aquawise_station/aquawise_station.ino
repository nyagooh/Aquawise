/*
 * Aquawise Station — HTTP POST to Django ingest endpoint
 *
 * Board  : ESP32
 * Library: ArduinoJson  (install via Library Manager: "ArduinoJson" by Benoit Blanchon)
 *
 * Public URL setup (ngrok):
 *   1. Install ngrok: https://ngrok.com/download
 *   2. Run: ngrok http 8000
 *   3. Copy the https://xxxx.ngrok-free.app URL into SERVER_URL below.
 *   4. Run Django with: python manage.py runserver 0.0.0.0:8000
 *
 * Usage:
 *   1. Set WIFI_SSID, WIFI_PASSWORD, SERVER_URL, STATION_NAME below.
 *   2. Flash to the board and open Serial Monitor at 115200 baud.
 *   3. If the preset WiFi doesn't connect within 5 s, a scan runs and you
 *      pick a network by number and enter the password via Serial.
 *   4. Follow the sensor prompts — enter each value, press Enter.
 *   5. The sketch packages the values as JSON and POSTs to /api/ingest/.
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ── Configuration ─────────────────────────────────────────────────────────────
const char* WIFI_SSID     = "Javis";
const char* WIFI_PASSWORD = "777ascii";

// Full public URL — paste your ngrok URL here (keep the /api/ingest/ path)
// Example: "https://abcd-1234.ngrok-free.app/api/ingest/"
const char* SERVER_URL = "https://YOUR-NGROK-URL.ngrok-free.app/api/ingest/";

// Must match a WaterSource name in the database exactly (case-insensitive)
const char* STATION_NAME = "Dunga Beach Station";
// ──────────────────────────────────────────────────────────────────────────────

WiFiClientSecure secureClient;

// ── Helpers ───────────────────────────────────────────────────────────────────

String readLine() {
  while (!Serial.available()) { delay(10); }
  String s = Serial.readStringUntil('\n');
  s.trim();
  return s;
}

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
    Serial.print("  (");
    Serial.print(WiFi.RSSI(i));
    Serial.print(" dBm)");
    if (WiFi.encryptionType(i) == WIFI_AUTH_OPEN) Serial.print("  [open]");
    Serial.println();
  }
  return n;
}

void pickWifi() {
  int n = scanAndPrint();
  if (n == 0) {
    Serial.println("Retrying scan in 5 s...");
    delay(5000);
    n = scanAndPrint();
    if (n == 0) return;
  }

  int choice = 0;
  while (choice < 1 || choice > n) {
    Serial.print("\nSelect network [1-");
    Serial.print(n);
    Serial.print("]: ");
    choice = readLine().toInt();
    if (choice < 1 || choice > n) Serial.println("Invalid selection, try again.");
  }
  String chosenSSID = WiFi.SSID(choice - 1);
  Serial.println(chosenSSID);

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

  Serial.println(WiFi.status() == WL_CONNECTED ? "\nConnected!" : "\nFailed to connect.");
}

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

  // Skip TLS certificate verification — fine for development with ngrok
  secureClient.setInsecure();

  Serial.println("\n=== Aquawise Station ===");
  connectWifi();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("IP address : ");
    Serial.println(WiFi.localIP());
    Serial.print("Sending to : ");
    Serial.println(SERVER_URL);
  }
  Serial.println("========================\n");
}

// ── Loop ──────────────────────────────────────────────────────────────────────

void loop() {
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
  http.begin(secureClient, SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  // ngrok requires this header to bypass the browser warning page
  http.addHeader("ngrok-skip-browser-warning", "true");

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
