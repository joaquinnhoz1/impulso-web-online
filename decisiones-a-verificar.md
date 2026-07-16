# Decisiones a verificar

Pendientes de la auditoría de `altoimpactoweb.lat` que necesitan una decisión o dato real
del dueño del negocio — no los toqué porque hubiera tenido que inventar información.

## 1. Email de contacto
El sitio muestra `studioimpulsoweb@gmail.com` (marca "Impulso Web", no "Alto Impacto Web").
Un email de otra marca en el punto de contacto es una señal de alerta para quien está por pagar.
**Decidir:** ¿usar un email con el dominio propio (`hola@altoimpactoweb.lat`) o mantener este?

## 2. Sección "Quién está detrás"
La web no muestra ninguna persona real (nombre, foto, historia). Es la mejora de confianza
más barata de hacer y una de las de mayor impacto.
**Necesito:** un nombre, una foto y 2-3 líneas de bio para armar la sección.

## 3. Testimonios existentes (María L., Roberto G., Ana P.)
Están en el sitio con iniciales, sin foto y sin link verificable al negocio del cliente.
No los toqué (no son fabricación mía), pero para que sumen de verdad como prueba social
**se necesitaría:** permiso del cliente real, foto y (idealmente) link a su sitio.

## 4. Portfolio en subdominios `vercel.app`
Los 5 proyectos del portfolio (Turnos Padel PRO, Matilde Empanadas, etc.) están alojados en
subdominios gratuitos de Vercel en vez de dominios propios del cliente.
**Decidir:** si vale la pena regalar/incluir un dominio propio (~ARS 10.000/año) a los próximos
clientes para que el portfolio muestre dominios reales.

## 5. Plan Business — precio y fecha
Dejé el plan en ARS 650.000 marcado como "Próximamente" (antes tenía una contradicción:
ARS 650.000 en la card vs USD 699 en el formulario, ya corregida). Falta definir si ese es
el precio final y cuándo pasa a estar disponible para la venta.

## 6. Política de pago y garantía
Agregué una respuesta genérica en el FAQ ("coordinamos la forma de pago que más te convenga")
porque no tengo el esquema real (seña + saldo, % exacto, etc.).
**Decidir:** términos concretos de pago y de la garantía de revisión, para reemplazar el texto genérico.

## 7. Panel `/admin/login.html` públicamente accesible
El panel de administración del sitio (guarda credenciales de clientes en `localStorage` del
navegador) es accesible por URL directa, aunque esté bloqueado para buscadores en `robots.txt`.
**Decidir:** si conviene sacarlo del deploy público y guardar esas credenciales en una
herramienta dedicada (gestor de contraseñas, Notion privado, etc.) en vez de en el navegador.
