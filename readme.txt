====================================================================
GUÍA DE INSTALACIÓN Y EJECUCIÓN - PROYECTO FERREMAS
====================================================================

--------------------------------------------------------------------
1. UBUNTU / DEBIAN
--------------------------------------------------------------------
# 1. Actualizar repositorios e instalar dependencias del sistema (Python + Node.js)
sudo apt update
sudo apt install python3 python3-pip python3-venv nodejs npm -y

# 2. Navegar a la carpeta exacta donde reside manage.py
# (Si tienes el proyecto en el Escritorio con carpeta anidada):
cd ~/Escritorio/web_FerreMas/web_FerreMas
# (Si no está anidado, ajusta la ruta a: cd ~/Escritorio/web_FerreMas)

# 3. Crear el entorno virtual
python3 -m venv venv

# 4. Activar el entorno virtual
source venv/bin/activate

# 5. Actualizar pip
python3 -m pip install --upgrade pip

# 6. Instalar dependencias de Python
pip install -r requirements.txt

# 7. (Opcional) Instalar dependencias de Node.js si se requiere compilar frontend
npm install

# 8. Iniciar el servidor de desarrollo de Django
python manage.py runserver --insecure

# 9. Abrir el proyecto en el navegador web:
http://127.0.0.1:8000


--------------------------------------------------------------------
2. macOS (Intel & Apple Silicon M1/M2/M3)
--------------------------------------------------------------------
# 1. Instalar Python moderno y Node.js con Homebrew
brew install python node

# 2. Navegar a la carpeta exacta donde reside manage.py
cd ~/Desktop/web_FerreMas/web_FerreMas
# (Si tu Mac está en español usa: cd ~/Escritorio/web_FerreMas/web_FerreMas)

# 3. Eliminar entorno anterior si dio problemas de versiones (Opcional)
rm -rf venv

# 4. Crear el entorno virtual
# En Macs Apple Silicon (M1/M2/M3):
/opt/homebrew/bin/python3 -m venv venv
# En Macs con procesador Intel:
python3 -m venv venv

# 5. Activar el entorno virtual
source venv/bin/activate

# 6. Actualizar pip dentro del entorno
python3 -m pip install --upgrade pip

# 7. Instalar dependencias de Python
pip install -r requirements.txt

# 8. (Opcional) Instalar dependencias de Node.js si se requiere compilar frontend
npm install

# 9. Iniciar el servidor de desarrollo de Django
python manage.py runserver --insecure

# 10. Abrir el proyecto en el navegador web:
http://127.0.0.1:8000


--------------------------------------------------------------------
3. WINDOWS (PowerShell / Command Prompt)
--------------------------------------------------------------------
# 1. Instalar Python y Node.js
# Descargar Python desde https://www.python.org/ (Marcar "Add Python to PATH")
# Descargar Node.js LTS desde https://nodejs.org/

# 2. Navegar a la carpeta del proyecto donde reside manage.py
cd %USERPROFILE%\Desktop\web_FerreMas\web_FerreMas

# 3. Crear el entorno virtual
python -m venv venv

# 4. Activar el entorno virtual
# En PowerShell:
.\venv\Scripts\Activate.ps1
# En Command Prompt (CMD):
.\venv\Scripts\activate.bat

# 5. Actualizar pip
python -m pip install --upgrade pip

# 6. Instalar dependencias de Python
pip install -r requirements.txt

# 7. (Opcional) Instalar dependencias de Node.js
npm install

# 8. Iniciar el servidor de desarrollo de Django
python manage.py runserver --insecure

# 9. Abrir el proyecto en el navegador web:
http://127.0.0.1:8000


====================================================================
ACTUALIZACIÓN Y SINCRONIZACIÓN DE RAMAS (GIT)
====================================================================
# 1. Configurar tu identidad en Git (ejecutar una sola vez por equipo):
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@example.com"

# 2. Descargar las ramas nuevas y referencias del servidor remoto (GitHub):
git fetch origin

# 3. Ver todas las ramas disponibles (locales y remotas):
git branch -a

# 4. Cambiarte a la rama que necesitas actualizar o revisar:
git switch nombre-de-la-rama

# 5. Descargar los últimos cambios a tu rama local:
git pull origin nombre-de-la-rama

# NOTA SI TIENES CAMBIOS LOCALES SIN GUARDAR:
git stash
git switch nombre-de-la-rama
git pull origin nombre-de-la-rama
git stash pop


====================================================================
NOTAS GENERALES Y SOLUCIÓN DE PROBLEMAS
====================================================================
- RUTA DE EJECUCIÓN:
  Asegúrate de ejecutar siempre los comandos dentro de la carpeta que contiene 
  el archivo 'manage.py' (en tu caso 'web_FerreMas/web_FerreMas').

- FRONTEND / RECURSOS ESTÁTICOS:
  El proyecto contiene 'package.json'. Si en algún momento necesitas reconstruir 
  estilos o componentes JS, ejecuta 'npm run build' o el comando correspondiente.

- ERROR "No matching distribution found for cffi/asgiref":
  Este error ocurre si intentas instalar el proyecto usando Python 3.9 o inferior.
  Asegúrate de haber creado el entorno virtual con Python 3.10 o superior.

- ERROR DE EJECUCIÓN EN WINDOWS (PowerShell):
  Si al ejecutar '.\venv\Scripts\Activate.ps1' sale un error de seguridad, 
  ejecuta primero este comando en PowerShell:
  Set-ExecutionPolicy Unrestricted -Scope Process

- NUNCA USAR 'sudo pip install':
  No uses 'sudo' para librerías de Python. Siempre activa el entorno virtual 
  primero y luego usa 'pip install'.

- GUARDAR NUEVAS LIBRERÍAS:
  Si instalas o actualizas dependencias de Python en el proyecto:
  pip freeze > requirements.txt