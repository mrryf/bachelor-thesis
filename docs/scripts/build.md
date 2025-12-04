# Build System

The build system is orchestrated by `scripts/build.sh`. It handles the compilation of LaTeX documents, including the Prestudy and the Thesis.

## Features

- **Selective Building**: Build only the Prestudy, only the Thesis, or both.
- **Cache Management**: Automatically clears Biber cache to prevent corruption.
- **Bibliography Handling**: Uses `BIBINPUTS` to ensure the bibliography is found regardless of the build directory.
- **Survey Data Integration**: Automatically generates LaTeX tables from survey data before building.

## Usage

```bash
./scripts/build.sh [options]
```

### Options

- `--prestudy`: Build the Prestudy document (default).
- `--thesis`: Build the Thesis document.
- `--all`: Build both documents.
- `--help`: Show usage information.
