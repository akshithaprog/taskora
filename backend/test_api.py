"""Backend tests.  Run with:  python -m unittest test_api -v"""
import unittest

from app import create_app
from extensions import db


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
        self.client = self.app.test_client()

    def tearDown(self):
        with self.app.app_context():
            db.drop_all()

    def register(self, email="a@example.com", name="Asha", password="Passw0rdX"):
        res = self.client.post("/api/auth/register", json={"name": name, "email": email, "password": password})
        return res

    def auth(self, email="a@example.com"):
        res = self.register(email)
        return {"Authorization": "Bearer " + res.get_json()["token"]}

    def test_register_login_me(self):
        res = self.register()
        self.assertEqual(res.status_code, 201)
        self.assertEqual(self.register().status_code, 400)  # duplicate email
        bad = self.client.post("/api/auth/login", json={"email": "a@example.com", "password": "nope"})
        self.assertEqual(bad.status_code, 401)
        ok = self.client.post("/api/auth/login", json={"email": "A@example.com", "password": "Passw0rdX"})
        token = ok.get_json()["token"]
        me = self.client.get("/api/auth/me", headers={"Authorization": "Bearer " + token})
        self.assertEqual(me.get_json()["user"]["name"], "Asha")

    def test_weak_password_and_bad_email(self):
        res = self.client.post("/api/auth/register", json={"name": "X", "email": "nope", "password": "short"})
        self.assertEqual(res.status_code, 400)
        self.assertIn("email", res.get_json()["fields"])
        self.assertIn("password", res.get_json()["fields"])

    def test_protected_routes(self):
        self.assertEqual(self.client.get("/api/tasks").status_code, 401)
        self.assertEqual(self.client.get("/api/stats").status_code, 401)
        res = self.client.get("/api/tasks", headers={"Authorization": "Bearer garbage"})
        self.assertEqual(res.status_code, 401)

    def test_task_crud_and_toggle(self):
        h = self.auth()
        res = self.client.post("/api/tasks", headers=h, json={
            "title": "Write tests", "priority": "high", "due_date": "2026-11-12", "category": "Work", "tags": ["#qa", "qa", "dev"]})
        self.assertEqual(res.status_code, 201)
        task = res.get_json()["task"]
        self.assertEqual(task["tags"], ["qa", "dev"])
        tid = task["id"]
        res = self.client.put(f"/api/tasks/{tid}", headers=h, json={"title": "Write more tests", "priority": "low"})
        self.assertEqual(res.get_json()["task"]["title"], "Write more tests")
        res = self.client.patch(f"/api/tasks/{tid}/toggle", headers=h, json={"today": "2026-11-10"})
        self.assertTrue(res.get_json()["task"]["completed"])
        self.assertEqual(res.get_json()["task"]["completed_on"], "2026-11-10")
        res = self.client.patch(f"/api/tasks/{tid}/toggle", headers=h, json={})
        self.assertFalse(res.get_json()["task"]["completed"])
        self.assertEqual(len(self.client.get("/api/tasks?q=more", headers=h).get_json()["tasks"]), 1)
        self.assertEqual(self.client.delete(f"/api/tasks/{tid}", headers=h).status_code, 200)
        self.assertEqual(self.client.get(f"/api/tasks/{tid}", headers=h).status_code, 404)

    def test_task_validation(self):
        h = self.auth()
        res = self.client.post("/api/tasks", headers=h, json={"title": "  ", "priority": "urgent", "due_date": "soon"})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(set(res.get_json()["fields"]), {"title", "priority", "due_date"})

    def test_users_cannot_touch_each_others_tasks(self):
        a, b = self.auth("a@example.com"), self.auth("b@example.com")
        tid = self.client.post("/api/tasks", headers=a, json={"title": "Private"}).get_json()["task"]["id"]
        self.assertEqual(self.client.get("/api/tasks", headers=b).get_json()["tasks"], [])
        self.assertEqual(self.client.get(f"/api/tasks/{tid}", headers=b).status_code, 404)
        self.assertEqual(self.client.put(f"/api/tasks/{tid}", headers=b, json={"title": "Hacked"}).status_code, 404)
        self.assertEqual(self.client.patch(f"/api/tasks/{tid}/toggle", headers=b).status_code, 404)
        self.assertEqual(self.client.delete(f"/api/tasks/{tid}", headers=b).status_code, 404)
        self.assertEqual(self.client.get(f"/api/tasks/{tid}", headers=a).get_json()["task"]["title"], "Private")

    def test_stats(self):
        h = self.auth()
        for title, pri, due in [("a", "high", "2026-11-01"), ("b", "low", "2026-11-20"), ("c", "medium", None)]:
            self.client.post("/api/tasks", headers=h, json={"title": title, "priority": pri, "due_date": due})
        first = self.client.get("/api/tasks", headers=h).get_json()["tasks"][0]["id"]
        self.client.patch(f"/api/tasks/{first}/toggle", headers=h, json={"today": "2026-11-10"})
        s = self.client.get("/api/stats?today=2026-11-10", headers=h).get_json()
        self.assertEqual((s["total"], s["completed"], s["pending"]), (3, 1, 2))
        self.assertEqual(s["overdue"], 0 if first else 1)
        self.assertEqual(len(s["weekly"]), 7)
        self.assertEqual(s["weekly"][-1]["completed"], 1)

    def test_password_change(self):
        h = self.auth()
        bad = self.client.post("/api/auth/password", headers=h, json={"current_password": "x", "new_password": "NewPass123"})
        self.assertEqual(bad.status_code, 400)
        ok = self.client.post("/api/auth/password", headers=h, json={"current_password": "Passw0rdX", "new_password": "NewPass123"})
        self.assertEqual(ok.status_code, 200)
        login = self.client.post("/api/auth/login", json={"email": "a@example.com", "password": "NewPass123"})
        self.assertEqual(login.status_code, 200)


if __name__ == "__main__":
    unittest.main()
