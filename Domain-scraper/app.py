from flask import Flask, jsonify, request
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
application = app

def get_transactions(url):
    selector1 = 'a.link--underlined'
    selector2 = ".caption.fs-sm"
    time_selector = ".color-text-secondary time"
    balSelector = "span.wb-bw"

    html = requests.get(url)
    if html:
        soup = BeautifulSoup(html.text, 'html.parser')
        elements = soup.select(selector1)
        elements2 = soup.select(selector2)
        time_data = soup.select(time_selector)
        amont = soup.select(balSelector)
        # print(f'Elements found for selector1: {len(elements)}')
        # print(f'Elements found for selector2: {len(elements2)}')
        # print(f'Elements found for time_selector: {len(time_data)}')

        data = [element.get_text(strip=True) for element in elements]
        confirmations = [element.get_text(strip=True) for element in elements2]
        time = [element.get_text(strip=True) for element in time_data]
        bal = [element.get_text(strip=True) for element in amont]
        # print(f'Data: {data}')
        # print(f'Confirmations: {confirmations}')
        # print(f'Time: {time}')

        result = []
        length = min(len(data), len(confirmations),len(balSelector))
        for i in range(length):
            result.append({
                'Transaction': data[i],
                'Confirmation': confirmations[i],
                # 'Time': time[i],
                'Amount': bal[i]
            })
        return result
    return None

@app.route('/get-transaction', methods=['GET'])
def get_transaction():
    tx_hash = request.args.get('hash')
    if tx_hash:
        url = f'https://blockchair.com/search?q={tx_hash}'
        data = get_transactions(url)
        if data:
            return jsonify(data), 200
        return jsonify({'error': 'Unable to fetch data'}), 500
    return jsonify({'error': 'Hash parameter is required'}), 400

@app.route('/', methods=['GET'])
def home():
    return jsonify({'Sucess': 'Hello World'}), 200

# if __name__ == '__main__':
    # app.run(debug=True)
