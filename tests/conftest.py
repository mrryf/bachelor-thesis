"""Shared pytest fixtures for thesis tests."""
import pytest
from pathlib import Path


@pytest.fixture(scope="session")
def prestudy_dir():
    """Path to prestudy document directory."""
    return Path("content/prestudy")


@pytest.fixture(scope="session")
def thesis_dir():
    """Path to thesis document directory."""
    return Path("content/thesis")


@pytest.fixture(scope="session")
def bibliography_path():
    """Path to shared bibliography file."""
    return Path("content/resources/bibliography.bib")


@pytest.fixture(scope="session")
def resources_dir():
    """Path to shared resources directory."""
    return Path("content/resources")
