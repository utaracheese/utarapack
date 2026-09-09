@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set /p "baseName=Nhập tên cơ sở muốn đổi: "

set "count=1"
for %%f in (*) do (
    if "%%~nx0" neq "%~nx0" (
        set "ext=%%~xf"
        ren "%%f" "!baseName!!count!!ext!"
        set /a "count+=1"
    )
)

echo Đã đổi tên thành công!
pause