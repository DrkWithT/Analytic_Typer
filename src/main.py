"""
    main.py
    @brief Runs the main server code.
    @author Derek Tan & ??
"""

from flask import Flask, render_template
from atexit import register

def exit_handler():
    # todo: close database connections, etc.
    print('Stopped app server.')

app = Flask(__name__)

@app.route('/')
@app.route('/typer')
def serve_typer_page():
    return render_template('typer.html', page_name='Type Test')

@app.errorhandler(Exception)
def handle_server_error(error: Exception):
    return f'Oops, something went wrong: {error}'

# Setup script exit handler.
register(exit_handler)

# Start server script.
app.run('localhost', port=8000)
