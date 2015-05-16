







let path = "data.json";
let db = jsondb(path, {key: "id", unique:true});
let data = db.readAll();
db.writeAll();

db.insert(data);
db.delete("id");
db.get("id");
db.getOrd(5);
