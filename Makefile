STATIC_DIR = static
OUTPUT_DIR = public

run: generate minify
	poetry run python -m http.server -d $(OUTPUT_DIR)/

generate:
	poetry run python generate_blogs.py
	poetry run python generate.py
	cp -r $(STATIC_DIR)/* $(OUTPUT_DIR)
	

minify:
	poetry run python minify.py


clean:
	rm -rf $(OUTPUT_DIR)
