"""
PCOSense Backend Server Launcher
Validates dependencies, model artifacts, and port availability before starting Uvicorn.
"""

import sys
import os
import socket

# Ensure repository root is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

HOST = "127.0.0.1"
PORT = 8000
MODEL_PATH = os.path.join(BASE_DIR, "models", "pcos_prediction_model.pkl")


def check_dependencies():
    """Verify that all essential Python packages are available."""
    missing = []
    required_modules = [
        ("fastapi", "fastapi"),
        ("uvicorn", "uvicorn"),
        ("pydantic", "pydantic"),
        ("pandas", "pandas"),
        ("numpy", "numpy"),
        ("sklearn", "scikit-learn"),
        ("joblib", "joblib"),
    ]
    for module_name, pkg_name in required_modules:
        try:
            __import__(module_name)
        except ImportError:
            missing.append(pkg_name)
    
    if missing:
        print(f"\n[backend] ERROR: Missing required Python package(s): {', '.join(missing)}")
        print("[backend] Please install all dependencies by running:")
        print("          pip install -r backend/requirements.txt\n")
        sys.exit(1)


def check_model_artifact():
    """Verify that the serialized Scikit-learn model exists."""
    if not os.path.exists(MODEL_PATH):
        print(f"\n[backend] ERROR: Serialized model artifact missing at:")
        print(f"          {MODEL_PATH}")
        print("[backend] Please verify models/pcos_prediction_model.pkl exists.\n")
        sys.exit(1)


def check_port_availability(host: str, port: int):
    """Check if the designated host and port are free."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind((host, port))
        except OSError:
            print(f"\n[backend] ERROR: FastAPI could not start because port {port} is already in use.")
            print(f"[backend] Another service or process is currently listening on http://{host}:{port}.")
            print(f"[backend] Please terminate the existing process on port {port} and try again.\n")
            sys.exit(1)


def main():
    print(f"[backend] Performing pre-flight startup checks...")
    check_dependencies()
    check_model_artifact()
    check_port_availability(HOST, PORT)

    print(f"[backend] Pre-flight checks passed successfully.")
    print(f"[backend] FastAPI running on http://{HOST}:{PORT}")
    print(f"[backend] Interactive Swagger docs: http://{HOST}:{PORT}/docs")
    print(f"[backend] Health check: http://{HOST}:{PORT}/health")

    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=HOST,
        port=PORT,
        log_level="info",
        reload=False
    )


if __name__ == "__main__":
    main()
