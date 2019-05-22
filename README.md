# lazy-login
A service which helps to easily get a login session

### Commands
- `npm run start`
- `npm run dev`

### Required arguments
- url (login page url containing login form)
- username
- password

### Example
```python
import requests

session = requests.session()
data = {
    'url': credential['url'],
    'username': credential['username'],
    'password': credential['password']
}
response = session.post('http://localhost:5000/api/request', data=data, timeout=3*60)

print response.json()
```
```
{u'postInfo': {u'cookie': u'*******', u'postData': {*******}, u'postUrl': u'*******'}}
```

### To do list
- Add captcha support
