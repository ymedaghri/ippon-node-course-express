db.createUser({ user: 'kanban', pwd: 'kanban', roles: [{role: 'readWrite',db: 'kanban'}]});
db = db.getSiblingDB('kanban');
db.createCollection('myCollection');
