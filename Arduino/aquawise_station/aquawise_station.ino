/*
 * Aquawise Station — HTTP POST to Django ingest endpoint
 *
 * Board  : ESP32 (or ESP8266 — change WiFi.h to ESP8266WiFi.h)
 * Library: ArduinoJson  (install via Library Manager: "ArduinoJson" by Benoit Blanchon)
 *
 * Usage:
 *   1. Set WIFI_SSID, WIFI_PASSWORD, SERVER_IP, STATION_NAME below.
 *   2. Flash to the board and open Serial Monitor at 115200 baud.
 *   3. Follow the prompts — enter each sensor value, press Enter.
 *   4. The sketch packages the values as JSON and POSTs to /api/ingest/.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ── Configuration ────────────────────────────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// IP address of the machine running Django (e.g. your laptop on the same network)
const char* SERVER_IP   = "192.168.1.100";
const int   SERVER_PORT = 8000;

// Must match a WaterSource name in the database exactly (case-insensitive)
const char* STATION_NAME = "Dunga Beach Station";
// ─────────────────────────────────────────────────────────────────────────────

String serverUrl;

void setup() {
  Serial.begin(115200);
  delay(1000);

  serverUrl = String("http://") + SERVER_IP + ":" + SERVER_PORT + "/api/ingest/";

  Serial.println("\n=== Aquawise Station ===");
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected.");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Sending to: ");
  Serial.println(serverUrl);
  Serial.println("========================\n");
}

// Read a float from Serial, blocking until the user hits Enter
float promptFloat(const char* label, const char* unit) {
  Serial.print("  ");
  Serial.print(label);
  Serial.print(" (");
  Serial.print(unit);
  Serial.print("): ");

  while (!Serial.available()) { delay(10); }
  String input = Serial.readStringUntil('\n');
  input.trim();
  float value = input.toFloat();
  Serial.println(value);
  return value;
}

void loop() {
  Serial.println("--- Enter sensor readings ---");

  float temperature     = promptFloat("Temperature",      "°C");
  float turbidity       = promptFloat("Turbidity",        "NTU");
  float ph              = promptFloat("pH",               "pH");
  float dissolvedOxygen = promptFloat("Dissolved Oxygen", "mg/L");
  float conductivity    = promptFloat("Conductivity",     "µS/cm");
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

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("ERROR: WiFi disconnected. Skipping send.");
    delay(3000);
    return;
  }

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
