from flask import Flask, jsonify, request
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

def get_page_source(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        print(f'Error fetching page source: {e}')
        return None

def get_transactions(url):
    selector1 = 'a.link--underlined'
    selector2 = ".caption.fs-sm"
    time_selector = ".color-text-secondary time"

    html = get_page_source(url)
    if html:
        soup = BeautifulSoup(html, 'html.parser')
        elements = soup.select(selector1)
        elements2 = soup.select(selector2)
        time_data = soup.select(time_selector)

        print(f'Elements found for selector1: {len(elements)}')
        print(f'Elements found for selector2: {len(elements2)}')
        print(f'Elements found for time_selector: {len(time_data)}')

        data = [element.get_text(strip=True) for element in elements]
        confirmations = [element.get_text(strip=True) for element in elements2]
        time = [element.get_text(strip=True) for element in time_data]

        print(f'Data: {data}')
        print(f'Confirmations: {confirmations}')
        print(f'Time: {time}')

        result = []
        length = min(len(data), len(confirmations))
        for i in range(length):
            result.append({
                'Transaction': data[i],
                'Confirmation': confirmations[i],
                # 'Time': time[i],
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

if __name__ == '__main__':
    app.run(debug=True, port=3000)
