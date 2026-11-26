# Compilación para Android (DRK · Simulador IMSS-SNTSS)

El proyecto está configurado con **Capacitor** y ya cuenta con la carpeta nativa `android/` sincronizada con la compilación web (`dist/`).

## Requisitos previos en tu equipo de desarrollo
1. **Node.js 20+**
2. **Java Development Kit (JDK 17 o 21)**
3. **Android Studio** (con **Android SDK** y **Android SDK Build-Tools** instalados)

## Opción 1: Compilar desde Android Studio
1. Ejecuta la sincronización web hacia Android tras cualquier cambio en `src/`:
   ```bash
   npm run android:sync
   ```
2. Abre el proyecto nativo en Android Studio:
   ```bash
   npm run android:open
   ```
   (o abre manualmente la carpeta `android/` desde Android Studio).
3. Espera a que Gradle sincronice y selecciona **Build > Build Bundle(s) / APK(s) > Build APK(s)** o **Generate Signed Bundle / APK** para publicación en Google Play.

## Opción 2: Compilar por línea de comandos (Gradle)
### Generar APK de depuración (`assembleDebug`)
```bash
npm run android:apk
```
El APK generado se ubicará en:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Generar Android App Bundle de lanzamiento (`bundleRelease`)
1. Configura tu keystore de firma en `android/app/build.gradle` (bloque `signingConfigs`).
2. Ejecuta:
```bash
npm run android:aab
```
El archivo `.aab` se ubicará en:
`android/app/build/outputs/bundle/release/app-release.aab`
