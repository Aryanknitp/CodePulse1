import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
service_text = "\n".join(p.read_text(encoding="utf-8") for p in (root / "frontend" / "src" / "services").glob("*.js"))
backend_routes = "\n".join(p.read_text(encoding="utf-8") for p in (root / "backend" / "src" / "routes").glob("*.js"))
refs = sorted(set(re.findall(r"""['"](/api/v1/[^'"]+)['"]""", service_text)))
groups = sorted(set(re.match(r"/api/v1/([a-z-]+)", ref).group(1) for ref in refs if re.match(r"/api/v1/([a-z-]+)", ref)))
route_groups = {p.stem for p in (root / "backend" / "src" / "routes").glob("*.js")}
missing = [g for g in groups if g not in route_groups]
if missing:
    raise SystemExit(f"Missing backend route groups: {missing}")
print(f"OK: {len(refs)} frontend API references map to backend groups: {', '.join(groups)}")
