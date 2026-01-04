import requests
import sys
import json
from datetime import datetime, timedelta

class TCSVolleyAPITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.admin_token = None
        self.user_id = None
        self.admin_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}, Expected: {expected_status}"
            
            if not success:
                try:
                    error_detail = response.json().get('detail', 'No detail provided')
                    details += f", Error: {error_detail}"
                except:
                    details += f", Response: {response.text[:100]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_seed_data(self):
        """Test seed data initialization"""
        print("\n🌱 Testing seed data initialization...")
        success, response = self.run_test(
            "Seed Data",
            "POST",
            "seed-data",
            200
        )
        return success

    def test_user_registration(self):
        """Test user registration with different license types"""
        print("\n👤 Testing user registration...")
        
        # Test competition license user
        test_user_data = {
            "email": f"test_competition_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "nom": "Testeur",
            "prenom": "Competition",
            "type_licence": "competition",
            "est_licencie": True
        }
        
        success, response = self.run_test(
            "Register Competition User",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            
        # Test jeu libre license user
        jeu_libre_data = {
            "email": f"test_jeu_libre_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "nom": "Testeur",
            "prenom": "JeuLibre",
            "type_licence": "jeu_libre",
            "est_licencie": True
        }
        
        self.run_test(
            "Register Jeu Libre User",
            "POST",
            "auth/register",
            200,
            data=jeu_libre_data
        )
        
        # Test non-licensed user
        non_licensed_data = {
            "email": f"test_non_licensed_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "nom": "Testeur",
            "prenom": "NonLicencie",
            "type_licence": "jeu_libre",
            "est_licencie": False
        }
        
        self.run_test(
            "Register Non-Licensed User",
            "POST",
            "auth/register",
            200,
            data=non_licensed_data
        )
        
        return success

    def test_admin_login(self):
        """Test admin login"""
        print("\n🔐 Testing admin login...")
        admin_credentials = {
            "email": "admin@tcssuzini.fr",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=admin_credentials
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            self.admin_id = response['user']['id']
            
        return success

    def test_user_profile(self):
        """Test user profile retrieval"""
        print("\n👤 Testing user profile...")
        if not self.token:
            self.log_test("Get User Profile", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.token}'}
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "users/me",
            200,
            headers=headers
        )
        return success

    def test_achievements(self):
        """Test achievements system"""
        print("\n🏆 Testing achievements...")
        if not self.token:
            self.log_test("Get Achievements", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.token}'}
        success, response = self.run_test(
            "Get Achievements",
            "GET",
            "achievements",
            200,
            headers=headers
        )
        return success

    def test_tournaments(self):
        """Test tournament functionality"""
        print("\n🏆 Testing tournaments...")
        if not self.token:
            self.log_test("Get Tournaments", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.token}'}
        
        # Get tournaments
        success, response = self.run_test(
            "Get Tournaments",
            "GET",
            "tournaments",
            200,
            headers=headers
        )
        
        # Create tournament as admin
        if self.admin_token:
            admin_headers = {'Authorization': f'Bearer {self.admin_token}'}
            tournament_data = {
                "nom": f"Tournoi Test {datetime.now().strftime('%H%M%S')}",
                "description": "Tournoi de test automatisé",
                "date_debut": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
                "date_fin": (datetime.now() + timedelta(days=8)).strftime('%Y-%m-%d'),
                "max_participants": 16
            }
            
            create_success, create_response = self.run_test(
                "Create Tournament (Admin)",
                "POST",
                "tournaments",
                200,
                data=tournament_data,
                headers=admin_headers
            )
            
            # Try to register for tournament
            if create_success and 'id' in create_response:
                tournament_id = create_response['id']
                register_success, _ = self.run_test(
                    "Register for Tournament",
                    "POST",
                    f"tournaments/{tournament_id}/register",
                    200,
                    headers=headers
                )
        
        return success

    def test_matches(self):
        """Test matches functionality"""
        print("\n⚽ Testing matches...")
        if not self.token:
            self.log_test("Get Matches", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.token}'}
        
        # Get matches
        success, response = self.run_test(
            "Get Matches",
            "GET",
            "matches",
            200,
            headers=headers
        )
        
        # Create match as admin
        if self.admin_token:
            admin_headers = {'Authorization': f'Bearer {self.admin_token}'}
            match_data = {
                "equipe_a": "TCS Suzini A",
                "equipe_b": "TCS Suzini B",
                "date": (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d'),
                "heure": "18:00",
                "lieu": "Salle TCS Suzini"
            }
            
            self.run_test(
                "Create Match (Admin)",
                "POST",
                "matches",
                200,
                data=match_data,
                headers=admin_headers
            )
        
        return success

    def test_news(self):
        """Test news functionality"""
        print("\n📰 Testing news...")
        if not self.token:
            self.log_test("Get News", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.token}'}
        
        # Get news
        success, response = self.run_test(
            "Get News",
            "GET",
            "news",
            200,
            headers=headers
        )
        
        # Create news as admin
        if self.admin_token:
            admin_headers = {'Authorization': f'Bearer {self.admin_token}'}
            news_data = {
                "titre": f"Actualité Test {datetime.now().strftime('%H%M%S')}",
                "contenu": "Ceci est une actualité de test automatisé pour vérifier le bon fonctionnement du système.",
                "image_url": "https://images.unsplash.com/photo-1628870571205-7e781523bfbc?q=80&w=2000"
            }
            
            self.run_test(
                "Create News (Admin)",
                "POST",
                "news",
                200,
                data=news_data,
                headers=admin_headers
            )
        
        return success

    def test_training_schedule(self):
        """Test training schedule"""
        print("\n🏃 Testing training schedule...")
        if not self.token:
            self.log_test("Get Training Schedule", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.token}'}
        success, response = self.run_test(
            "Get Training Schedule",
            "GET",
            "training-schedule",
            200,
            headers=headers
        )
        return success

    def test_rankings(self):
        """Test rankings"""
        print("\n🏆 Testing rankings...")
        if not self.token:
            self.log_test("Get Rankings", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.token}'}
        success, response = self.run_test(
            "Get Rankings",
            "GET",
            "rankings",
            200,
            headers=headers
        )
        return success

    def test_access_control(self):
        """Test access control for admin endpoints"""
        print("\n🔒 Testing access control...")
        if not self.token:
            self.log_test("Access Control Test", False, "No user token available")
            return False
            
        # Try to create tournament with regular user token (should fail)
        headers = {'Authorization': f'Bearer {self.token}'}
        tournament_data = {
            "nom": "Tournoi Non Autorisé",
            "description": "Ce tournoi ne devrait pas être créé",
            "date_debut": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
            "date_fin": (datetime.now() + timedelta(days=8)).strftime('%Y-%m-%d'),
            "max_participants": 16
        }
        
        success, response = self.run_test(
            "Create Tournament (Regular User - Should Fail)",
            "POST",
            "tournaments",
            403,  # Expecting forbidden
            data=tournament_data,
            headers=headers
        )
        
        return success

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting TCS Suzini Volleyball Club API Tests")
        print("=" * 60)
        
        # Initialize data
        self.test_seed_data()
        
        # Test authentication
        self.test_user_registration()
        self.test_admin_login()
        
        # Test core functionality
        self.test_user_profile()
        self.test_achievements()
        self.test_tournaments()
        self.test_matches()
        self.test_news()
        self.test_training_schedule()
        self.test_rankings()
        
        # Test security
        self.test_access_control()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
            return 1

def main():
    tester = TCSVolleyAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())