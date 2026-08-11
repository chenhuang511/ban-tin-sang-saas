' ==========================================================
'  chay-ngam-watch.vbs
'  Khoi chay theo-doi-va-deploy.bat O CHE DO NGAM (khong hien cua so),
'  de tien trinh watch chay nen suot phien dang nhap Windows.
'  Dung boi Task Scheduler "At Log On".
' ==========================================================
Dim sh, here
Set sh = CreateObject("WScript.Shell")
here = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = here
' 0 = cua so an ; False = khong cho ket thuc
sh.Run """" & here & "\theo-doi-va-deploy.bat""", 0, False
