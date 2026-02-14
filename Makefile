.PHONY: install test lint run-backend run-frontend clean

install:
	cd backend && python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt
	cd frontend && npm install

test:
	cd backend && . venv/bin/activate && pytest
	cd frontend && npm test

lint:
	cd backend && . venv/bin/activate && ruff check . && black --check .
	cd frontend && npm run lint

run-backend:
	cd backend && . venv/bin/activate && uvicorn main:app --reload

run-frontend:
	cd frontend && npm run dev

clean:
	rm -rf backend/venv
	rm -rf frontend/.next
	rm -rf frontend/node_modules
