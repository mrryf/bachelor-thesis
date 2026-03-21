# latexmk configuration for thesis builds
$pdf_mode = 1;          # Generate PDF via pdflatex
$biber = 'biber %O %S'; # Use biber for bibliography
$clean_ext = 'run.xml synctex.gz'; # Additional clean extensions
