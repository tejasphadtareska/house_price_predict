import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import pickle

df = pd.read_csv('../House Price Dataset.csv')
features = ['square_footage', 'bedrooms', 'bathrooms', 'year_built', 'lot_size', 'distance_to_city_center', 'school_rating']
X = df[features]
y = df['price']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = LinearRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
model_data = {
    'model': model,
    'mse': mse,
    'r2': r2,
    'coefficients': dict(zip(features, model.coef_)),
    'intercept': model.intercept_
}
with open('model.pkl', 'wb') as f:
    pickle.dump(model_data, f)
print('Model trained and saved.')