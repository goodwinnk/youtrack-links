docker run -it ^
  -v "%cd%/src:/work/app" ^
  -v "%cd%/secret/.clasprc.json:/root/.clasprc.json" ^
  -w "/work/app" ^
  --name youtrack-links-env ^
  custom-clasp-image