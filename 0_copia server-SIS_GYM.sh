#! /bin/bash

# ------------------------------------------------- ---------
# un simple script de sigma-gym : DEV a mod Produccion.
# versión 1.1, actualizada diciembre 2025.
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
DESTINO_SSH="pablinux@192.168.10.150"
# Forzar a que solo intente password y no use llaves guardadas que fallan
OPCIONES_SSH="-o IdentitiesOnly=yes"

# --- SECCIÓN DE COMPILACIÓN ---
echo "¿Deseas compilar el proyecto antes de enviar? (s/n)"
read -p "> " desea_compilar

if [ "$desea_compilar" = "s" ] || [ "$desea_compilar" = "S" ]; then
    echo "**** VAMOS A COMPILAR EL PROYECTO *****"
    npm run build
    if [ $? -ne 0 ]; then
        echo "#### ERROR: La compilación falló ####"
        exit 1
    fi
else
    echo "Saltando compilación..."
fi

# --- SECCIÓN DE ENVÍO ---
echo "----------------------------------------"
echo "Selecciona una opción de transferencia:"
echo "1) Usar SCP (Copia completa)"
echo "2) Usar RSYNC (Solo actualizar cambios)"
echo "0) Salir"
echo "----------------------------------------"
read -p "Opción: " seleccion

case $seleccion in
    1)  
        echo "**** Iniciado copia SCP al SERVIDOR ****"
        scp $OPCIONES_SSH -r "${DirAppSIGMA_GYM}static/" "${DESTINO_SSH}:${DirSIGMA_servWeb}"
        scp $OPCIONES_SSH "${DirAppSIGMA_GYM}index.html" "${DESTINO_SSH}:${DirSIGMA_servWeb}"
        echo "**** FIN COPIA SCP ****"
        ;;
    2)
        echo "**** Iniciado copia RSYNC al SERVIDOR ****"
        rsync -avz -e "ssh $OPCIONES_SSH" --update "${DirAppSIGMA_GYM}" "${DESTINO_SSH}:${DirSIGMA_servWeb}"
        echo "**** FIN COPIA RSYNC ****"
        ;;
    0)
        echo "Saliendo..."
        exit 0
        ;;
    *)
        echo "Opción no válida."
        exit 1
        ;;
esac