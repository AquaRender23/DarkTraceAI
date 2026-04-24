from flask import Flask, render_template, redirect, url_for, request

app = Flask(__name__)


# -------------------------
# HOME → redirect to login
# -------------------------
@app.route('/')
def home():
    return redirect(url_for('login'))


# -------------------------
# LOGIN PAGE
# -------------------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        # 🔥 temporary logic (replace later with DB)
        if username == "admin" and password == "1234":
            return redirect(url_for('threat'))

    return render_template('login.html')


# -------------------------
# REGISTER PAGE
# -------------------------
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        fullname = request.form.get('fullname')
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        # 🔥 later: save to DB
        print(fullname, username, email, password)

        return redirect(url_for('login'))

    return render_template('register.html')


# -------------------------
# DASHBOARD / THREAT PAGE
# -------------------------
@app.route('/threat')
def threat():
    return render_template('threat.html')

@app.route('/report')
def report():
    result = {
        'threat_name': 'DoS Slowhttptest',
        'confidence': 28.03,
        'is_attack': True,
        'model': 'XGBoost Classifier',
        'scan_time': '24 Apr 2026, 09:21 PM',
        'request_id': '#DRK-2026-0424-0921'
    }
    return render_template('report.html', result=result)

# -------------------------
# RUN APP
# -------------------------
if __name__ == '__main__':
    app.run(debug=True)