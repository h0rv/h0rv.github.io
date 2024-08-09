STATIC_DIR = static
OUTPUT_DIR = public

run: generate minify
	poetry run python -m http.server -d $(OUTPUT_DIR)/

generate:
	poetry run python main.py
	cp -r $(STATIC_DIR)/* $(OUTPUT_DIR)

minify:
	poetry run python minify.py

install:
	poetry install

clean:
	rm -rf $(OUTPUT_DIR)
	rm -rf .venv/
