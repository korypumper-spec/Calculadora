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

## Opción 3: Compilación automática en GitHub Actions
El repositorio incluye dos flujos de trabajo en `.github/workflows/`:
1. **`ci-web.yml`**: Ejecuta verificación de tipos (`npm run lint`), pruebas unitarias (`npm test`) y compilación web (`npm run build`), publicando el artefacto `drk-web-dist`.
2. **`build-android.yml`**: Ejecuta la verificación web, sincroniza Capacitor (`npx cap sync android`) y compila el APK de depuración (`app-debug.apk`) como artefacto descargable `drk-android-debug-apk` en cada push/PR o de forma manual desde la pestaña **Actions**.

Para compilar un **Release AAB firmado** desde GitHub Actions (manualmente activando `build_release` o al publicar un tag `v*`), configura estos secretos en **Settings > Secrets and variables > Actions**:
- `ANDROID_KEYSTORE_BASE64` (archivo `.keystore` / `.jks` codificado en Base64)
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

