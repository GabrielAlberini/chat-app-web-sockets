# Gabo Chat

Gabo Chat es una aplicación de chat simple construida con Express.js, Socket.IO y SQLite. Permite a los usuarios enviar y recibir mensajes en tiempo real.

# Getting started

Para obtener una copia local en funcionamiento, sigue estos sencillos pasos.

### Prerrequisitos

- Node.js instalado en tu máquina
- Base de datos SQLite

### Instalación

1. Clona el repositorio
2. Install NPM packages
3. Set up environment variables by creating a .env file and filling in the required values:

```javascript
PORT = 3000;
API_URL = your_api_url;
API_TOKEN = your_api_token;
```

## Uso

1. Inicia el servidor
2. Abre `index.html` en tu navegador web

## Funcionalidades

- Mensajería en tiempo real usando Socket.IO
- Los mensajes se guardan en una base de datos SQLite
- Recuperación del estado de la conexión para recuperar mensajes al reconectar
- Soporta usuarios anónimos
