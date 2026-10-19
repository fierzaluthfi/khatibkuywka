@echo off
title Push Codingan ke GitHub - fierzaluthfi/khatibkuywka
echo ========================================================
echo   MENGHUBUNGKAN CODINGAN KE GITHUB
echo   Repository: https://github.com/fierzaluthfi/khatibkuywka.git
echo ========================================================
echo.

set "PATH=C:\Program Files\Git\cmd;%PATH%"

cd /d "%~dp0"

echo Memeriksa status git...
git status -s

echo.
echo Mengunggah (push) file ke branch main di GitHub...
echo Jendela browser Brave/login GitHub akan muncul sesaat lagi...
echo.

git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  ALHAMDULILLAH BERHASIL! 
    echo  Codingan website telah terunggah ke GitHub:
    echo  https://github.com/fierzaluthfi/khatibkuywka
    echo ========================================================
) else (
    echo ========================================================
    echo  Gagal mengunggah.
    echo  Pastikan Anda login dengan akun GitHub: fierzaluthfi
    echo ========================================================
)

echo.
echo Tekan tombol apa saja untuk menutup jendela ini...
pause >nul
