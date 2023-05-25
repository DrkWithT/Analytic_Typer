"""
    main.py
    @brief Runs the main server code.
    @author Derek Tan & ??
    @version 0.1.0
"""

from atexit import register
from flask import Flask, render_template, request
from utils.testmaker import generate_prose

def exit_handler():
    # TODO: close sqlite connections, etc.
    print('Stopped app server.')

app = Flask(__name__)

@app.route('/', methods=['GET'])
@app.route('/typer', methods= ['GET'])
def serve_typer_page():
    return render_template('typer.html', page_name='Type Test')

@app.route('/api/typer', methods=['GET'])
def api_get():
    raw_words = generate_prose(True, None, None)

    # build dictionary to store automatic JSON formatted data... this is for setting the user's type test! 
    response_data = {
        "original": raw_words
    }

    return response_data

@app.route('/api/typer', methods=['POST'])
def api_post_result():
    typerResults = None
    ok_status = True  # NOTE: if the JSON from the type tester client was ok... this may need a property check later: user and original text must be present.
    
    try:
        typerResults = request.get_json()
    except Exception as err:
        print(f'JSON error: {err}')
        ok_status = False
    else:
        print(f'Original Text: {typerResults.original}\nUser Text: {typerResults.user}'); # TODO: replace this print statment with function calls for the analytical code.

    return {"ok": ok_status}

@app.errorhandler(Exception)
def handle_server_error(error: Exception):
    return f'Oops, something went wrong: {error}'

# Setup script exit handler.
register(exit_handler)

# Start server script.
app.run('localhost', port=8000)
