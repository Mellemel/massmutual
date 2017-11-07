# import sys
import sqlite3

from flask import request, render_template, Flask, jsonify, send_from_directory

app = Flask(__name__)

DATABASE = "../recruit.db"

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

def query_db(query, parameters = {}):

    result_dict = {}

    try:
        connection = sqlite3.connect(DATABASE)

        cursor = connection.cursor()
        cursor.execute(query, parameters)
        result_dict = dictfetchall(cursor)

    except sqlite3.OperationalError as e:
        print("Db operation error", e)
        result_dict["error"] = str(e)
    # except:
    #     e = sys.exc_info()[0]
    #     print("An error occurred with the database", e)
    #     result_dict["error"] = str(e)
    else:
        cursor.close()
        connection.close()

    return result_dict


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/api/gender-income-spending', methods=['GET'])
def api_gender_income():

    query = """
    select gender, 
    max(income) as income_max, avg(income) as income_avg, min(income) as income_min,
    max(travel_spending) as travel_spending_max, avg(travel_spending) as travel_spending_avg, min(travel_spending) as travel_spending_min,
    max(sports_leisure_spending) as sports_leisure_spending_max, avg(sports_leisure_spending) as sports_leisure_spending_avg, min(sports_leisure_spending) as sports_leisure_spending_min
    from customer 
    group by gender
    """

    result_dict = query_db(query)
    # print(result_dict)

    return jsonify({'data': result_dict})

@app.route('/api/race-economic-stability', methods=['GET'])
def api_economic_stability():

    query = """
    select race.value as race_code, economic_stability, count(*) customer_count
    from customer
    inner join race on customer.race_code == race.code
    group by race_code, economic_stability
    order by race_code, economic_stability
    """

    result_dict = query_db(query)
    # print(result_dict)

    return jsonify({'data': result_dict})

@app.route('/api/state-social', methods=['GET'])
def api_income_spending_state():

    query = """
    select state, 
    max(youtube_user_rank) youtube_user_rank_max, avg(youtube_user_rank) youtube_user_rank_avg, min(youtube_user_rank) youtube_user_rank_min,
    max(facebook_user_rank) facebook_user_rank_max, avg(facebook_user_rank) facebook_user_rank_avg, min(facebook_user_rank) facebook_user_rank_min 
    from (select state, cast(youtube_user_rank as integer) youtube_user_rank, cast(facebook_user_rank as integer) facebook_user_rank from customer) 
    group by state
    """

    result_dict = query_db(query)
    # print(result_dict)

    return jsonify({'data': result_dict})

@app.route('/api/all', methods=['GET'])
def api_all():

    parameters = {}

    query = """
    select c.*, r.value race, e.value education, i.value insurance_segment
    from customer c
    left join education e
    on c.education_id = e.id
    left join insurance_segment i
    on c.insurance_segment_id = i.id
    left join race r
    on c.race_code = r.code
    where 1
    """

    gender = request.args.get('gender')
    if gender is not None:
        query = query + " and gender = :gender"
        parameters["gender"] = gender

    education_id = request.args.get('education_id')
    if education_id is not None:
        query = query + " and education_id = :education_id"
        parameters["education_id"] = education_id

    home_owner = request.args.get('home_owner')
    if home_owner is not None:
        query = query + " and home_owner = :home_owner"
        parameters["home_owner"] = home_owner

    insurance_segment_id = request.args.get('insurance_segment_id')
    if insurance_segment_id is not None:
        query = query + " and insurance_segment_id = :insurance_segment_id"
        parameters["insurance_segment_id"] = insurance_segment_id

    race_code = request.args.get('race_code')
    if race_code is not None:
        query = query + " and race_code = :race_code"
        parameters["race_code"] = race_code

    state = request.args.get('state')
    if state is not None:
        query = query + " and state = :state"
        parameters["state"] = state

    result_dict = query_db(query, parameters)
    # print(result_dict)

    return jsonify({'data': result_dict})

if __name__ == '__main__':
    app.run()
