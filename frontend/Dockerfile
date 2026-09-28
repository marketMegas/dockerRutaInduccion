# 1. Usamos una base que ya tiene Python 3.10 y Node.js 18 listos para usar
FROM nikolaik/python-nodejs:python3.10-nodejs18

# 2. Creamos la carpeta de trabajo dentro del servidor
WORKDIR /app

# 3. Copiamos todos los archivos de tu proyecto al servidor
COPY . .

# 4. Instalamos las dependencias de Node/React
RUN npm install

# 5. Instalamos las dependencias de Python (Asegúrate de tener tu requirements.txt)
RUN pip install --no-cache-dir -r requirements.txt

# 6. Exponemos los puertos (Aquí puse 3000 para Node y 5000 para Python, cámbialos si usas otros)
EXPOSE 3000 5000

# 7. EL COMANDO DE ARRANQUE (AQUÍ FALTA INFORMACIÓN)
CMD ["npm", "start"]