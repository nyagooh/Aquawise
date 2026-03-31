/*
 * Aquawise Station — HTTP POST to Django ingest endpoint
 *
 * Board  : ESP32
 * Library: ArduinoJson  (install via Library Manager: "ArduinoJson" by Benoit Blanchon)
 *
 * Public URL setup (ngrok):
 *   1. Install ngrok: https://ngrok.com/download
 *   2. Run: ngrok http 8000
 *   3. Copy the https://xxxx.ngrok-free.app URL into DEFAULT_SERVER_URL below.
 *   4. Run Django with: python manage.py runserver 0.0.0.0:8000
 *
 * On each boot:
 *   - Press 1 (or wait 5 s) to keep the current server URL.
 *   - Press 2 to paste a new URL via Serial.
 *   - Press 1 (or wait 5 s) to connect to the preset WiFi.
 *   - Press 2 to scan and pick a different network.
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ── Configuration ─────────────────────────────────────────────────────────────
const char* DEFAULT_WIFI_SSID     = "Javis";
const char* DEFAULT_WIFI_PASSWORD = "777ascii";

// Full public URL — paste your ngrok URL here (keep the /api/ingest/ path)
// Example: "https://abcd-1234.ngrok-free.app/api/ingest/"
const char* DEFAULT_SERVER_URL = "https://YOUR-NGROK-URL.ngrok-free.app/api/ingest/";

// Must match a WaterSource name in the database exactly (case-insensitive)
const char* STATION_NAME = "Dunga Beach Station";

#define CHOICE_TIMEOUT_MS 5000
// ──────────────────────────────────────────────────────────────────────────────

WiFiClientSecure secureClient;
String serverUrl;

// ── Helpers ───────────────────────────────────────────────────────────────────

// Block until a full line is typed, then return it trimmed.
String readLine() {
  while (!Serial.available()) { delay(10); }
  String s = Serial.readStringUntil('\n');
  s.trim();
  return s;
}

// Wait up to timeoutMs for the user to press '1' or '2'.
// Prints a live countdown. Returns '1', '2', or 0 on timeout.
char promptChoice(unsigned long timeoutMs) {
  unsigned long start   = millis();
  int           lastSec = -1;

  while (millis() - start < timeoutMs) {
    int secsLeft = (timeoutMs - (millis() - start)) / 1000;
    if (secsLeft != lastSec) {
      Serial.print("\r  Choice (");
      Serial.print(secsLeft);
      Serial.print("s)... ");
      lastSec = secsLeft;
    }

    if (Serial.available()) {
      char c = Serial.read();
      while (Serial.available()) Serial.read();  // flush rest
      if (c == '1' || c == '2') {
        Serial.println(c);
        return c;
      }
    }
    delay(50);
  }
  Serial.println("\n  -> Timed out, using default.");
  return 0;
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

// ── URL configuration ─────────────────────────────────────────────────────────

void configureUrl() {
  Serial.println("---- Server URL ----");
  Serial.print("  Current: ");
  Serial.println(serverUrl);
  Serial.println("  Press 1 to keep  |  Press 2 to enter a new URL");

  char choice = promptChoice(CHOICE_TIMEOUT_MS);
  if (choice == '2') {
    Serial.print("  Paste new URL: ");
    serverUrl = readLine();
    Serial.print("  URL set to: ");
    Serial.println(serverUrl);
  } else {
    Serial.println("  Keeping current URL.");
  }
}

// ── WiFi ──────────────────────────────────────────────────────────────────────

int scanAndPrint() {
  Serial.println("\n  Scanning for WiFi networks...");
  int n = WiFi.scanNetworks();
  if (n == 0) {
    Serial.println("  No networks found.");
    return 0;
  }
  for (int i = 0; i < n; i++) {
    Serial.print("    [");
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
    Serial.println("  Retrying scan in 5 s...");
    delay(5000);
    n = scanAndPrint();
    if (n == 0) return;
  }

  int choice = 0;
  while (choice < 1 || choice > n) {
    Serial.print("\n  Select network [1-");
    Serial.print(n);
    Serial.print("]: ");
    choice = readLine().toInt();
    if (choice < 1 || choice > n) Serial.println("  Invalid selection, try again.");
  }
  String chosenSSID = WiFi.SSID(choice - 1);
  Serial.println(chosenSSID);

  Serial.print("  Password (blank if open): ");
  String password = readLine();

  Serial.print("  Connecting to ");
  Serial.print(chosenSSID);
  Serial.print("...");

  WiFi.begin(chosenSSID.c_str(), password.c_str());
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(WiFi.status() == WL_CONNECTED ? "\n  Connected!" : "\n  Failed to connect.");
}

void connectToPreset() {
  Serial.print("  Connecting to ");
  Serial.print(DEFAULT_WIFI_SSID);
  Serial.print("...");

  WiFi.begin(DEFAULT_WIFI_SSID, DEFAULT_WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n  Connected!");
  } else {
    Serial.println("\n  Preset network not reachable.");
    WiFi.disconnect(true);
    delay(500);
    pickWifi();
  }
}

void configureWifi() {
  Serial.println("---- WiFi ----");
  Serial.print("  Preset SSID: ");
  Serial.println(DEFAULT_WIFI_SSID);
  Serial.println("  Press 1 to connect to preset  |  Press 2 to choose another network");

  char choice = promptChoice(CHOICE_TIMEOUT_MS);
  if (choice == '2') {
    WiFi.disconnect(true);
    delay(500);
    pickWifi();
  } else {
    connectToPreset();
  }
}

// ── Setup ─────────────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  delay(1000);

  secureClient.setInsecure();  // skip TLS cert check — fine for dev/ngrok
  serverUrl = String(DEFAULT_SERVER_URL);

  Serial.println("\n======= Aquawise Station =======");

  configureUrl();
  Serial.println();
  configureWifi();

  Serial.println("\n================================");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("IP address : ");
    Serial.println(WiFi.localIP());
  }
  Serial.print("Server URL : ");
  Serial.println(serverUrl);
  Serial.println("================================\n");
}

// ── Loop ──────────────────────────────────────────────────────────────────────

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost. Reconnecting...");
    WiFi.disconnect(true);
    delay(500);
    connectToPreset();
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
  http.begin(secureClient, serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("ngrok-skip-browser-warning", "true");

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.print("HTTP status: ");
    Serial.println(httpCode);
    Serial.print("Response:    ");
    Serial.println(http.getString());
  } else {
    Serial.print("HTTP error:  ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
  Serial.println("\n--- Reading sent. Ready for next. ---\n");

  delay(1000);
}
