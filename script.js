// רשימת ערים לדוגמה (בהמשך נטען קובץ מלא)
const cities = ["תל אביב", "ירושלים", "חיפה", "באר שבע", "ראשון לציון", "פתח תקווה", "אשדוד", "נתניה", "חולון", "בני ברק"];

// בדיקת משתמש מחובר בעמוד הראשי
window.addEventListener('load', async function() {
    const user = await supabaseManager.getCurrentUser();
    if (!user) {
        // אם אין משתמש מחובר, העבר לדף התחברות
        window.location.href = 'auth.html';
        return;
    }
    
    // הצגת פרטי המשתמש
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    userName.textContent = `שלום, ${user.user_metadata?.full_name || user.email}`;
    userInfo.style.display = 'block';
});

// כפתור התנתקות
document.getElementById('logoutBtn').addEventListener('click', async function() {
    const result = await supabaseManager.signOut();
    if (result.success) {
        window.location.href = 'auth.html';
    }
});

const cityInput = document.getElementById('city');
const citySuggestions = document.getElementById('citySuggestions');

cityInput.addEventListener('input', function() {
    const value = this.value.trim();
    citySuggestions.innerHTML = '';
    if (value.length === 0) {
        citySuggestions.style.display = 'none';
        return;
    }
    const filtered = cities.filter(city => city.startsWith(value));
    if (filtered.length > 0) {
        filtered.forEach(city => {
            const li = document.createElement('li');
            li.textContent = city;
            li.onclick = () => {
                cityInput.value = city;
                citySuggestions.innerHTML = '';
                citySuggestions.style.display = 'none';
            };
            citySuggestions.appendChild(li);
        });
        citySuggestions.style.display = 'block';
    } else {
        citySuggestions.style.display = 'none';
    }
});

document.addEventListener('click', function(e) {
    if (!citySuggestions.contains(e.target) && e.target !== cityInput) {
        citySuggestions.style.display = 'none';
    }
});

// לוגיקה ראשונית לטופס
const form = document.getElementById('connectionForm');
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const searchParams = {
        connection_type: formData.get('connectionType'),
        offer_or_request: formData.get('offerOrRequest'),
        region: formData.get('region'),
        city: formData.get('city')
    };

    // חיפוש חיבורים ב-Supabase
    const result = await supabaseManager.searchConnections(searchParams);
    
    if (result.success) {
        displayResults(result.data);
    } else {
        alert('שגיאה בחיפוש: ' + result.error);
    }
});

// כפתור יצירת חיבור חדש
const createBtn = document.getElementById('createConnection');
createBtn.addEventListener('click', function() {
    showCreateConnectionForm();
});

// הצגת תוצאות חיפוש
function displayResults(connections) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    if (connections.length === 0) {
        resultsDiv.innerHTML = '<p>לא נמצאו תוצאות</p>';
        return;
    }
    
    connections.forEach(connection => {
        const connectionDiv = document.createElement('div');
        connectionDiv.style.cssText = 'border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px;';
        connectionDiv.innerHTML = `
            <h3>${connection.title || 'חיבור'}</h3>
            <p><strong>סוג:</strong> ${getConnectionTypeText(connection.connection_type)}</p>
            <p><strong>אזור:</strong> ${getRegionText(connection.region)}</p>
            <p><strong>עיר:</strong> ${connection.city}</p>
            <p><strong>תיאור:</strong> ${connection.description || 'אין תיאור'}</p>
            <p><strong>תאריך:</strong> ${new Date(connection.created_at).toLocaleDateString('he-IL')}</p>
        `;
        resultsDiv.appendChild(connectionDiv);
    });
}

// הצגת טופס יצירת חיבור חדש
function showCreateConnectionForm() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>צור חיבור חדש</h2>
        <form id="newConnectionForm">
            <label for="newTitle">כותרת:</label>
            <input type="text" id="newTitle" name="title" required>
            
            <label for="newConnectionType">סוג חיבור:</label>
            <select id="newConnectionType" name="connectionType" required>
                <option value="">בחר סוג חיבור</option>
                <option value="barter">ברטר</option>
                <option value="service">שירות בד'ענה</option>
                <option value="collaboration">שיתוף פעולה</option>
                <option value="acquaintance">הכרות</option>
                <option value="help">עזרה</option>
                <option value="advice">עצה</option>
                <option value="recommendation">המלצה</option>
            </select>
            
            <label for="newOfferOrRequest">אני רוצה:</label>
            <select id="newOfferOrRequest" name="offerOrRequest" required>
                <option value="">בחר</option>
                <option value="give">לתת</option>
                <option value="get">לקבל</option>
            </select>
            
            <label for="newRegion">אזור:</label>
            <select id="newRegion" name="region" required>
                <option value="">בחר אזור</option>
                <option value="south">דרום</option>
                <option value="north">צפון</option>
                <option value="center">מרכז</option>
                <option value="shfela">שפלה</option>
                <option value="jerusalem">ירושלים</option>
                <option value="sharon">השרון</option>
            </select>
            
            <label for="newCity">עיר:</label>
            <input type="text" id="newCity" name="city" required>
            
            <label for="newDescription">תיאור:</label>
            <textarea id="newDescription" name="description" rows="4" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;"></textarea>
            
            <button type="submit">שמור חיבור</button>
            <button type="button" onclick="location.reload()">ביטול</button>
        </form>
    `;
    
    document.getElementById('newConnectionForm').addEventListener('submit', handleCreateConnection);
}

// טיפול ביצירת חיבור חדש
async function handleCreateConnection(e) {
    e.preventDefault();
    
    const user = await supabaseManager.getCurrentUser();
    if (!user) {
        alert('עליך להתחבר כדי ליצור חיבור');
        window.location.href = 'auth.html';
        return;
    }
    
    const formData = new FormData(e.target);
    const connectionData = {
        user_id: user.id,
        title: formData.get('title'),
        connection_type: formData.get('connectionType'),
        offer_or_request: formData.get('offerOrRequest'),
        region: formData.get('region'),
        city: formData.get('city'),
        description: formData.get('description'),
        status: 'active'
    };
    
    const result = await supabaseManager.createConnection(connectionData);
    
    if (result.success) {
        alert('החיבור נשמר בהצלחה!');
        location.reload();
    } else {
        alert('שגיאה בשמירת החיבור: ' + result.error);
    }
}

// פונקציות עזר לתרגום
function getConnectionTypeText(type) {
    const types = {
        'barter': 'ברטר',
        'service': 'שירות בד\'ענה',
        'collaboration': 'שיתוף פעולה',
        'acquaintance': 'הכרות',
        'help': 'עזרה',
        'advice': 'עצה',
        'recommendation': 'המלצה'
    };
    return types[type] || type;
}

function getRegionText(region) {
    const regions = {
        'south': 'דרום',
        'north': 'צפון',
        'center': 'מרכז',
        'shfela': 'שפלה',
        'jerusalem': 'ירושלים',
        'sharon': 'השרון'
    };
    return regions[region] || region;
} 