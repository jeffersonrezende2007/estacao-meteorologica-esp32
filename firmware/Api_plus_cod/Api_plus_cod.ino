
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <Wire.h>
#include <DHT.h>
#include <Adafruit_AHTX0.h>
#include <Adafruit_BMP280.h>
#include <math.h>

// ========================================
// 1. CONFIGURACAO DO WIFI
// ========================================

#include "secrets.h"  // nome e senha do Wi-Fi (arquivo fora do GitHub)

const char* SSID = WIFI_SSID;
const char* SENHA = WIFI_SENHA;

// Servidor HTTP na porta 80
WebServer server(80);
// Nome na rede: o ESP32 fica acessivel em http://estacao.local
const char* NOME_REDE = "estacao";
bool mdnsAtivo = false;

// ========================================
// 2. MAPEAMENTO DE PINOS
// ========================================

#define PINO_DHT 4
#define TIPO_DHT DHT22
#define PINO_LDR 35
#define PINO_MQ 34

// ========================================
// 3. OBJETOS DOS SENSORES
// ========================================

DHT dht(PINO_DHT, TIPO_DHT);
Adafruit_AHTX0 aht;
Adafruit_BMP280 bmp;

bool ahtDisponivel = false;
bool bmpDisponivel = false;

// ========================================
// 4. VARIAVEIS DAS LEITURAS
// ========================================

float tempDHT = NAN;
float humDHT = NAN;

float tempAHT = NAN;
float humAHT = NAN;

float tempBMP = NAN;
float pressao = NAN;

int nivelGas = 0;
int estadoLuz = 0;

unsigned long ultimaLeitura = 0;
const unsigned long INTERVALO_LEITURA = 3000;

// ========================================
// 5. FUNCOES AUXILIARES
// ========================================

// Converte float em texto JSON.
// Valores invalidos viram null.
String numeroJSON(float valor, int casas = 2) {
  if (isnan(valor) || isinf(valor)) {
    return "null";
  }

  return String(valor, casas);
}

// ========================================
// 6. LEITURA DOS SENSORES
// ========================================

void atualizarSensores() {
  // Sensor de gas MQ
  nivelGas = analogRead(PINO_MQ);

  // Sensor de luminosidade LDR
  estadoLuz = digitalRead(PINO_LDR);

  // DHT22
  humDHT = dht.readHumidity();
  tempDHT = dht.readTemperature();

  // AHT20
  if (ahtDisponivel) {
    sensors_event_t umidade, temperatura;
    aht.getEvent(&umidade, &temperatura);

    tempAHT = temperatura.temperature;
    humAHT = umidade.relative_humidity;
  } else {
    tempAHT = NAN;
    humAHT = NAN;
  }

  // BMP280
  if (bmpDisponivel) {
    tempBMP = bmp.readTemperature();
    pressao = bmp.readPressure();
  } else {
    tempBMP = NAN;
    pressao = NAN;
  }

  // Exibicao no Monitor Serial
  Serial.println("======= ESTACAO METEOROLOGICA =======");

  Serial.print("IP: ");
  Serial.println(WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : "SEM WI-FI");

  Serial.print("Nome na rede: ");
  Serial.println(mdnsAtivo ? "http://estacao.local" : "mDNS desligado");

  Serial.print("Luz: ");
  Serial.println(estadoLuz == 0 ? "CLARO" : "ESCURO");

  Serial.print("Gas (ADC): ");
  Serial.println(nivelGas);

  Serial.print("Temperatura DHT22: ");
  Serial.println(tempDHT);

  Serial.print("Umidade DHT22: ");
  Serial.println(humDHT);

  Serial.print("Temperatura AHT20: ");
  Serial.println(tempAHT);

  Serial.print("Umidade AHT20: ");
  Serial.println(humAHT);

  Serial.print("Temperatura BMP280: ");
  Serial.println(tempBMP);

  Serial.print("Pressao (Pa): ");
  Serial.println(pressao);

  Serial.println("=====================================");
}

// ========================================
// INICIA O mDNS (nome estacao.local)
// ========================================

void iniciarMDNS() {
  if (MDNS.begin(NOME_REDE)) {
    MDNS.addService("http", "tcp", 80);
    mdnsAtivo = true;
    Serial.print("Acesse tambem por: http://");
    Serial.print(NOME_REDE);
    Serial.println(".local");
  } else {
    Serial.println("Falha ao iniciar o mDNS.");
  }
}

// ========================================
// 7. ROTA PRINCIPAL
// ========================================

void rotaInicial() {
  server.send(
    200,
    "text/plain; charset=utf-8",
    "API da Estacao Meteorologica ESP32 funcionando!"
  );
}

// ========================================
// 8. ROTA: /api/dados
// ========================================

void rotaDados() {
  String luz = estadoLuz == 0 ? "CLARO" : "ESCURO";

  String json = "{";

  json += "\"dispositivo\":\"ESP32\",";
  json += "\"luminosidade\":\"" + luz + "\",";
  json += "\"nivel_gas\":" + String(nivelGas) + ",";

  json += "\"dht22\":{";
  json += "\"temperatura_c\":" + numeroJSON(tempDHT) + ",";
  json += "\"umidade_percentual\":" + numeroJSON(humDHT);
  json += "},";

  json += "\"aht20\":{";
  json += "\"temperatura_c\":" + numeroJSON(tempAHT) + ",";
  json += "\"umidade_percentual\":" + numeroJSON(humAHT);
  json += "},";

  json += "\"bmp280\":{";
  json += "\"temperatura_c\":" + numeroJSON(tempBMP) + ",";
  json += "\"pressao_pa\":" + numeroJSON(pressao);
  json += "}";

  json += "}";

  server.send(200, "application/json; charset=utf-8", json);
}

// ========================================
// 9. ROTA: /api/status
// ========================================

void rotaStatus() {
  String json = "{";

  json += "\"wifi_conectado\":";
  json += (WiFi.status() == WL_CONNECTED) ? "true" : "false";

  json += ",\"ip\":\"";
  json += WiFi.status() == WL_CONNECTED
          ? WiFi.localIP().toString()
          : "";
  json += "\"";

  json += ",\"aht20_disponivel\":";
  json += ahtDisponivel ? "true" : "false";

  json += ",\"bmp280_disponivel\":";
  json += bmpDisponivel ? "true" : "false";

  json += "}";

  server.send(200, "application/json; charset=utf-8", json);
}

// ========================================
// 10. CONFIGURACAO INICIAL
// ========================================

void setup() {
  Serial.begin(115200);

  Serial.println();
  Serial.println("Iniciando a estacao meteorologica...");

  pinMode(PINO_LDR, INPUT);

  // I2C: SDA = 21, SCL = 22
  Wire.begin(21, 22);

  dht.begin();

  ahtDisponivel = aht.begin();

  if (ahtDisponivel) {
    Serial.println("AHT20 iniciado!");
  } else {
    Serial.println("AHT20 nao encontrado.");
  }

  // Tenta os enderecos I2C do BMP280
  bmpDisponivel = bmp.begin(0x76);

  if (!bmpDisponivel) {
    bmpDisponivel = bmp.begin(0x77);
  }

  if (bmpDisponivel) {
    Serial.println("BMP280 iniciado!");
  } else {
    Serial.println("BMP280 nao encontrado.");
  }

  // Conexao Wi-Fi
  WiFi.mode(WIFI_STA);
  WiFi.setHostname(NOME_REDE);
  WiFi.begin(SSID, SENHA);

  Serial.print("Conectando ao Wi-Fi");

  unsigned long inicioWiFi = millis();

  while (WiFi.status() != WL_CONNECTED &&
         millis() - inicioWiFi < 20000) {
    delay(250);
    Serial.print(".");
  }

  Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
    Serial.print("IP do ESP32: ");
    Serial.println(WiFi.localIP());
    iniciarMDNS();
  } else {
    Serial.println(
      "Wi-Fi nao conectado. Tentaremos novamente no loop."
    );
  }

  // Registro das rotas HTTP
  server.on("/", HTTP_GET, rotaInicial);
  server.on("/api/dados", HTTP_GET, rotaDados);
  server.on("/api/status", HTTP_GET, rotaStatus);

  server.onNotFound([]() {
    server.send(
      404,
      "application/json",
      "{\"erro\":\"Rota nao encontrada\"}"
    );
  });

  // Inicia o servidor HTTP
  server.begin();

  Serial.println("Servidor HTTP iniciado!");

  // Primeira leitura dos sensores
  atualizarSensores();
  ultimaLeitura = millis();
}

// ========================================
// 11. LOOP PRINCIPAL
// ========================================

void loop() {
  // Atende requisicoes HTTP continuamente
  server.handleClient();

  // Tenta reconectar se o Wi-Fi cair
  static unsigned long ultimaTentativaWiFi = 0;

    if (WiFi.status() != WL_CONNECTED) {
    mdnsAtivo = false;

    if (millis() - ultimaTentativaWiFi >= 10000) {
      ultimaTentativaWiFi = millis();
      WiFi.reconnect();
    }
  } else if (!mdnsAtivo) {
    // Wi-Fi voltou (ou conectou depois do setup): reativa o nome
    iniciarMDNS();
  }

  // Atualiza sensores a cada 3 segundos
  if (millis() - ultimaLeitura >= INTERVALO_LEITURA) {
    ultimaLeitura = millis();
    atualizarSensores();
  }

  delay(2);
}
