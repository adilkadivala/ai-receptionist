"""Write the api's OpenAPI description to a file, for the dashboard's generated TypeScript client.

    uv run python -m scripts.export_openapi ../../packages/api-client/openapi.json

CI runs this and fails if the committed file is out of date.
"""

import json
import sys
from pathlib import Path

from api.main import app


def main() -> None:
    out = Path(sys.argv[1])
    out.write_text(json.dumps(app.openapi(), indent=2) + "\n")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
