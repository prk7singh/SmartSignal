
# coding: utf-8

# In[173]:


import pylab
import calendar
import numpy as np
import pandas as pd
import seaborn as sn
from scipy import stats
import missingno as msno
from datetime import datetime
import matplotlib.pyplot as plt
import warnings
pd.options.mode.chained_assignment = None
warnings.filterwarnings("ignore", category=DeprecationWarning)
get_ipython().magic('matplotlib inline')


# In[174]:


dailyData = pd.read_csv("/home/priyanka/Downloads/train.csv")


# In[175]:


dailyData["date"] = dailyData.datetime.apply(lambda x : x.split()[0])
dailyData["hour"] = dailyData.datetime.apply(lambda x : x.split()[1].split(":")[0])
dailyData["weekday"] = dailyData.date.apply(lambda dateString : calendar.day_name[datetime.strptime(dateString,"%Y-%m-%d").weekday()])


# In[176]:


dailyData  = dailyData.drop(["datetime"],axis=1)


# In[177]:


dataTypeDf = pd.DataFrame({"date": dailyData["date"], "count": dailyData["countA"]})
fig,ax = plt.subplots()
fig.set_size_inches(20,10)
sn.barplot(data=dataTypeDf,x="date",y="count",ax=ax)
ax.set(xlabel='Date', ylabel='Count',title="Training Data")


# In[178]:


msno.matrix(dailyData,figsize=(12,5))


# In[179]:


fig, axes = plt.subplots(nrows=2,ncols=2)
fig.set_size_inches(12, 10)
sn.boxplot(data=dailyData,y="countA",orient="v",ax=axes[0][0])
sn.boxplot(data=dailyData,y="countA",x="workingday",orient="v",ax=axes[0][1])
sn.boxplot(data=dailyData,y="countA",x="weather",orient="v",ax=axes[1][0])
sn.boxplot(data=dailyData,y="countA",x="unusual condition",orient="v",ax=axes[1][1])

axes[0][0].set(ylabel='Count',title="Box Plot On Count")
axes[0][1].set(xlabel='Working Day', ylabel='Count',title="Box Plot On Count Across Working Day")
axes[1][0].set(xlabel='Weather', ylabel='Count',title="Box Plot On Count Across Weather")
axes[1][1].set(xlabel='Unusual condition', ylabel='Count',title="Box Plot On Count Across Unusual condition")


# In[180]:


dailyDataWithoutOutliers = dailyData[np.abs(dailyData["countA"]-dailyData["countA"].mean())<=(1.5*dailyData["countA"].std())]


# In[181]:


corrMatt = dailyData[["workingday","weather","road condition","unusual condition","countA"]].corr()
mask = np.array(corrMatt)
mask[np.tril_indices_from(mask)] = False
fig,ax= plt.subplots()
fig.set_size_inches(20,10)
sn.heatmap(corrMatt, mask=mask,vmax=.8, square=True,annot=True)


# In[182]:


fig,(ax1,ax2,ax3,ax4) = plt.subplots(ncols=4)
fig.set_size_inches(12, 5)
sn.regplot(x="workingday", y="countA", data=dailyData,ax=ax1)
sn.regplot(x="weather", y="countA", data=dailyData,ax=ax2)
sn.regplot(x="road condition", y="countA", data=dailyData,ax=ax3)
sn.regplot(x="unusual condition", y="countA", data=dailyData,ax=ax4)


# In[183]:


fig,axes = plt.subplots(ncols=2,nrows=2)
fig.set_size_inches(12, 10)
sn.distplot(dailyData["countA"],ax=axes[0][0])
stats.probplot(dailyData["countA"], dist='norm', fit=True, plot=axes[0][1])
sn.distplot(np.log(dailyDataWithoutOutliers["countA"]),ax=axes[1][0])
stats.probplot(np.log1p(dailyDataWithoutOutliers["countA"]), dist='norm', fit=True, plot=axes[1][1])


# In[184]:


dataTrain = pd.read_csv("/home/priyanka/Downloads/train.csv")
dataTest = pd.read_csv("/home/priyanka/Downloads/test.csv")


# In[185]:


data = dataTrain.append(dataTest)
data.reset_index(inplace=True)
data.drop('index',inplace=True,axis=1)


# In[186]:


data["date"] = data.datetime.apply(lambda x : x.split()[0])
data["hour"] = data.datetime.apply(lambda x : x.split()[1].split(":")[0]).astype("int")
data["year"] = data.datetime.apply(lambda x : x.split()[0].split("-")[0])
data["weekday"] = data.date.apply(lambda dateString : datetime.strptime(dateString,"%Y-%m-%d").weekday())


# In[187]:


from sklearn.ensemble import RandomForestRegressor

dataCount0 = data[data["rain"]==0]
dataCount = data[data["rain"]>0]
rfModel_work = RandomForestRegressor()
workColumns = ["weather","road condition","unusual condition","workingday"]
rfModel_work.fit(dataCount[workColumns], dataCount["rain"])

work0Values = rfModel_work.predict(X= dataCount0[workColumns])
print(len(work0Values))
print(work0Values)
dataCount0["rain"] = work0Values
print(len(dataCount0))
data = dataCount.append(dataCount0)
data.reset_index(inplace=True)
data.drop('index',inplace=True,axis=1)

print(data)


# In[188]:


dataTrain = data[data["countA"]>0].sort_values(by=["datetime"])
print(len(dataTrain))
dataTest = data[data["countA"]==0].sort_values(by=["datetime"])
print(len(dataTest))
datetimecol = dataTest["datetime"]
yLabels = dataTrain["countA"]
dropFeatures = ["countA","datetime","date"]
dataTrain  = dataTrain.drop(dropFeatures,axis=1)
print(len(dataTrain))
dataTest  = dataTest.drop(dropFeatures,axis=1)
print(len(dataTest))


# In[189]:


def rmsle(y, y_,convertExp=True):
    if convertExp:
        y = np.exp(y),
        y_ = np.exp(y_)
    log1 = np.nan_to_num(np.array([np.log(v + 1) for v in y]))
    log2 = np.nan_to_num(np.array([np.log(v + 1) for v in y_]))
    calc = (log1 - log2) ** 2
    return np.sqrt(np.mean(calc))


# In[190]:


from sklearn.linear_model import LinearRegression,Ridge,Lasso
from sklearn.model_selection import GridSearchCV
from sklearn import metrics
import warnings
pd.options.mode.chained_assignment = None
warnings.filterwarnings("ignore", category=DeprecationWarning)

# Initialize logistic regression model
lModel = LinearRegression()

# Train the model
yLabelsLog = np.log1p(yLabels)
lModel.fit(X = dataTrain,y = yLabelsLog)

# Make predictions
preds = lModel.predict(X= dataTrain)
print (preds)
nppreds = np.exp(preds)
print (nppreds)
print ("RMSLE Value For Linear Regression: ",rmsle(np.exp(yLabelsLog),np.exp(preds),False))


# In[191]:


ridge_m_ = Ridge()
ridge_params_ = { 'max_iter':[3000],'alpha':[0.1, 1, 2, 3, 4, 10, 30,100,200,300,400,800,900,1000]}
rmsle_scorer = metrics.make_scorer(rmsle, greater_is_better=False)
grid_ridge_m = GridSearchCV( ridge_m_,
                          ridge_params_,
                          scoring = rmsle_scorer,
                          cv=5)
yLabelsLog = np.log1p(yLabels)
grid_ridge_m.fit( dataTrain, yLabelsLog )
preds = grid_ridge_m.predict(X= dataTrain)
print (grid_ridge_m.best_params_)
print ("RMSLE Value For Ridge Regression: ",rmsle(np.exp(yLabelsLog),np.exp(preds),False))

fig,ax= plt.subplots()
fig.set_size_inches(12,5)
df = pd.DataFrame(grid_ridge_m.grid_scores_)
df["alpha"] = df["parameters"].apply(lambda x:x["alpha"])
df["rmsle"] = df["mean_validation_score"].apply(lambda x:-x)
sn.pointplot(data=df,x="alpha",y="rmsle",ax=ax)


# In[192]:


lasso_m_ = Lasso()

alpha  = 1/np.array([0.1, 1, 2, 3, 4, 10, 30,100,200,300,400,800,900,1000])
lasso_params_ = { 'max_iter':[3000],'alpha':alpha}

grid_lasso_m = GridSearchCV( lasso_m_,lasso_params_,scoring = rmsle_scorer,cv=5)
yLabelsLog = np.log1p(yLabels)
grid_lasso_m.fit( dataTrain, yLabelsLog )
preds = grid_lasso_m.predict(X= dataTrain)
print (grid_lasso_m.best_params_)
print ("RMSLE Value For Lasso Regression: ",rmsle(np.exp(yLabelsLog),np.exp(preds),False))

fig,ax= plt.subplots()
fig.set_size_inches(12,5)
df = pd.DataFrame(grid_lasso_m.grid_scores_)
df["alpha"] = df["parameters"].apply(lambda x:x["alpha"])
df["rmsle"] = df["mean_validation_score"].apply(lambda x:-x)
sn.pointplot(data=df,x="alpha",y="rmsle",ax=ax)


# In[193]:


from sklearn.ensemble import RandomForestRegressor
rfModel = RandomForestRegressor(n_estimators=100)
yLabelsLog = np.log1p(yLabels)
rfModel.fit(dataTrain,yLabelsLog)
preds = rfModel.predict(X= dataTrain)
print ("RMSLE Value For Random Forest: ",rmsle(np.exp(yLabelsLog),np.exp(preds),False))


# In[194]:


def calculate(x):
    if x>30:
        return (x/2)*1.20
    else:
        return (1.89*x)
    
submission = pd.DataFrame({
        "datetime": datetimecol,
        "countPredA": [max(0, x) for x in np.exp(preds)],
        "countPredB": [max(0,calculate(x))  for x in np.exp(preds)]
    })
submission.to_csv('/home/priyanka/Downloads/predictions.csv', index=False)


# In[196]:


fig,ax = plt.subplots()
fig.set_size_inches(20,10)
sn.barplot(data=submission,x="datetime",y="countPredA",ax=ax)
ax.set(xlabel='Date', ylabel='Count',title="Predicted Count")

