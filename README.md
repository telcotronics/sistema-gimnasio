# sistema-gimnasio
 Sistema para gimnasios. PHP, MySQL, Vue y Vuetify
# '''Pasos basicos
 npm install para instalar las dependencias de package.json mysql 

 # VUE EM 10MIN
 https://www.youtube.com/watch?v=9AHMihFhrzw&ab_channel=TheCoderCaveesp
 


 rutas en router:index.js

## Produccion 
para compilar se usa el sigueinte comando
´´´bash
npm run build
´´´

2. Componente Vue.js para Tarjeta de Acceso (MiembroAccessCard.vue)
Este componente te permitirá visualizar una tarjeta de acceso para un miembro específico, generando un código de barras o un código QR a partir de su matrícula.

Para que este componente funcione, necesitarás instalar dos librerías en tu proyecto Vue.js:

jsbarcode: Para generar códigos de barras.

qrcode.vue: Para generar códigos QR en Vue 2.

Instala las dependencias ejecutando en tu terminal:

npm install jsbarcode qrcode.vue@1.7.0
# o si usas yarn
yarn add jsbarcode qrcode.vue@1.7.0
