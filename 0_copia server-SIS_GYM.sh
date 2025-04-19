#! /bin/bash

# ------------------------------------------------- ---------
# un simple script de sigma-gym : DEV a mod Produccion.
# versión 1, actualizada el 26 de septiembre de 2023.
# copyright 2025 pablinux, http://telcotronics.com
# ------------------------------------------------- ---------
# Este trabajo tiene licencia bajo Creative Commons 
# Reconocimiento-CompartirIgual 3.0 Licencia no exportada;
# ver http://creativecommons.org/licenses/by-sa/3.0/ 
# para más información.
# ------------------------------------------------- ---------

# -r=(recursive) carpetas y subcarpetas
# -u=(update) para que actualice el contenido en la carpeta destino y sólo copie datos que no estuvieran ya en el destino.
# -v=(vervose) muestra en pantalla las tareas que va realizando.
#DirAppSIGMA_DATOS="'/media/pablinux/DATOS\ DIGIT/PROGRAMAS/SIGMA/SIGMA LINUX/'"

DirAppSIGMA_GYM="/home/pablinux/Projects/Node/sistema-gimnasio/dist/"
DirSIGMA_servWeb="/var/www/web_gimnasio/public_html/"

#dirApp="/home/pablinux/SIGMA/"
echo "**** VAMOS A COMPILAR EL PROYECTO *****"
npm run build
echo "****iniciado copia SIGMA-WEB al SERVIDOR****"
scp -r ${DirAppSIGMA_GYM}"static/" pablinux@192.168.20.150:${DirSIGMA_servWeb}
scp  ${DirAppSIGMA_GYM}"index.html" pablinux@192.168.20.150:${DirSIGMA_servWeb}
echo "****FIN COPIA SIGMA-WEB AL SERVIDOR****"



