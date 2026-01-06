// script.js - Admin Dashboard Logic

const API_BASE_URL = 'http://localhost:5000/api';

// --- Authentication and Redirection ---
document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser || loggedInUser.role !== 'admin') {
        alert('Access denied. Please log in as an administrator.');
        window.location.href = 'adminloginpage.html';
        return;
    }
    // If admin is logged in, show default section and fetch data
    showSection('customers');
    fetchAndDisplayAllData();
});

function logoutAdmin() {
    localStorage.removeItem('loggedInUser');
    alert('Logged out successfully!');
    window.location.href = 'adminloginpage.html';
}

// --- UI Navigation ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    // Re-fetch data for the active section if needed (already done by fetchAndDisplayAllData)
}

// --- Message Box for Dashboard Operations ---
const dashboardMessageBox = document.getElementById('dashboardMessageBox');

function showDashboardMessage(message, type) {
    dashboardMessageBox.textContent = message;
    dashboardMessageBox.className = `message-box ${type}`;
    dashboardMessageBox.style.display = 'block';
    setTimeout(() => {
        dashboardMessageBox.style.display = 'none';
    }, 3000); // Hide after 3 seconds
}

// --- Data Fetching and Display ---

async function fetchAndDisplayAllData() {
    await fetchAndDisplayUsers();
    await fetchAndDisplayProducts();
    updateCounts();
}

async function fetchAndDisplayUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        const customers = users.filter(user => user.role === 'customer');
        const sellers = users.filter(user => user.role === 'seller');

        renderUsersTable(customers, 'customerTableBody');
        renderUsersTable(sellers, 'sellerTableBody');
    } catch (error) {
        console.error('Error fetching users:', error);
        showDashboardMessage('Failed to load users.', 'error');
    }
}

function renderUsersTable(users, tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    tableBody.innerHTML = ''; // Clear existing rows
    if (users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3">No ${tableBodyId === 'customerTableBody' ? 'customers' : 'sellers'} found.</td></tr>`;
        return;
    }
    users.forEach(user => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <button class="action" onclick="openEditUserModal('${user._id}')">Edit</button>
                <button class="action delete" onclick="deleteUser('${user._id}', '${user.role}')">Delete</button>
            </td>
        `;
    });
}

async function fetchAndDisplayProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`); // Reuse existing products API
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        renderProductsTable(products, 'productTableBody');
    } catch (error) {
        console.error('Error fetching products:', error);
        showDashboardMessage('Failed to load products.', 'error');
    }
}

function renderProductsTable(products, tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    tableBody.innerHTML = ''; // Clear existing rows
    if (products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6">No products found.</td></tr>`;
        return;
    }
    products.forEach(product => {
        const imageUrl = product.imageData || 'https://via.placeholder.com/60?text=No+Image'; // Placeholder image
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td><img src="${imageUrl}" alt="${product.name}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;"></td>
            <td>${product.name}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.category || 'N/A'}</td>
            <td>${product.sellerId || 'N/A'}</td>
            <td>
                <button class="action" onclick="openEditProductModal('${product._id}')">Edit</button>
                <button class="action delete" onclick="deleteProduct('${product._id}')">Delete</button>
            </td>
        `;
    });
}

function updateCounts() {
    document.getElementById('totalCustomers').textContent = document.getElementById('customerTableBody').rows.length;
    document.getElementById('totalSellers').textContent = document.getElementById('sellerTableBody').rows.length;
    document.getElementById('totalProducts').textContent = document.getElementById('productTableBody').rows.length;
}

// --- CRUD Operations ---

// User (Customer/Seller) Operations
async function deleteUser(userId, role) {
    if (!confirm(`Are you sure you want to delete this ${role}?`)) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Deletion failed.');
        }

        showDashboardMessage(`${role} deleted successfully!`, 'success');
        fetchAndDisplayUsers(); // Refresh the user tables
        updateCounts();
    } catch (error) {
        console.error('Error deleting user:', error);
        showDashboardMessage(`Failed to delete ${role}: ${error.message}`, 'error');
    }
}

// Product Operations
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Deletion failed.');
        }

        showDashboardMessage('Product deleted successfully!', 'success');
        fetchAndDisplayProducts(); // Refresh the product table
        updateCounts();
    } catch (error) {
        console.error('Error deleting product:', error);
        showDashboardMessage(`Failed to delete product: ${error.message}`, 'error');
    }
}


// --- Modals and Forms ---

const editUserModal = document.getElementById('editUserModal');
const editUserForm = document.getElementById('editUserForm');
const editUserIdInput = document.getElementById('editUserId');
const editUserNameInput = document.getElementById('editUserName');
const editUserEmailInput = document.getElementById('editUserEmail');
const editUserRoleSelect = document.getElementById('editUserRole');

const editProductModal = document.getElementById('editProductModal');
const editProductForm = document.getElementById('editProductForm');
const editProductIdInput = document.getElementById('editProductId');
const editProductNameInput = document.getElementById('editProductName');
const editProductPriceInput = document.getElementById('editProductPrice');
const editProductCategoryInput = document.getElementById('editProductCategory');
const editProductDescriptionInput = document.getElementById('editProductDescription');
const editProductImageInput = document.getElementById('editProductImage');
const editProductImagePreview = document.getElementById('editProductImagePreview');

let currentProductImageData = ''; // To store existing image data if not changed

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex'; // Use flex to center
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    // Clear image preview on product modal close
    if (modalId === 'editProductModal') {
        editProductImageInput.value = ''; // Clear file input
        editProductImagePreview.src = '';
        editProductImagePreview.style.display = 'none';
        currentProductImageData = '';
    }
    // Reset forms when closing modals
    if (modalId === 'editUserModal') {
        editUserForm.reset();
    }
    if (modalId === 'editProductModal') {
        editProductForm.reset();
    }
}

// Close modals if clicked outside
window.onclick = function(event) {
    if (event.target == editUserModal) {
        closeModal('editUserModal');
    }
    if (event.target == editProductModal) {
        closeModal('editProductModal');
    }
}


// Populate and open Edit User Modal
async function openEditUserModal(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`); // Fetch specific user details
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const user = await response.json();

        editUserIdInput.value = user._id;
        editUserNameInput.value = user.name;
        editUserEmailInput.value = user.email;
        editUserRoleSelect.value = user.role;
        openModal('editUserModal');
    } catch (error) {
        console.error('Error fetching user for edit:', error);
        showDashboardMessage('Failed to load user details for editing.', 'error');
    }
}

// Handle Edit User Form Submission
editUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = editUserIdInput.value;
    const updatedUser = {
        name: editUserNameInput.value,
        email: editUserEmailInput.value,
        role: editUserRoleSelect.value,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Update failed.');
        }

        showDashboardMessage('User updated successfully!', 'success');
        closeModal('editUserModal');
        fetchAndDisplayUsers(); // Refresh the user tables
        updateCounts();
    } catch (error) {
        console.error('Error updating user:', error);
        showDashboardMessage(`Failed to update user: ${error.message}`, 'error');
    }
});


// Populate and open Edit Product Modal
async function openEditProductModal(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`); // Fetch specific product details
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const product = await response.json();

        editProductIdInput.value = product._id;
        editProductNameInput.value = product.name;
        editProductPriceInput.value = product.price;
        editProductCategoryInput.value = product.category;
        editProductDescriptionInput.value = product.description;
        currentProductImageData = product.imageData; // Store existing image data

        if (product.imageData) {
            editProductImagePreview.src = product.imageData;
            editProductImagePreview.style.display = 'block';
        } else {
            editProductImagePreview.style.display = 'none';
        }

        openModal('editProductModal');
    } catch (error) {
        console.error('Error fetching product for edit:', error);
        showDashboardMessage('Failed to load product details for editing.', 'error');
    }
}

// Handle image preview when file is selected
editProductImageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            editProductImagePreview.src = e.target.result;
            editProductImagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        editProductImagePreview.src = '';
        editProductImagePreview.style.display = 'none';
    }
});


// Handle Edit Product Form Submission
editProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = editProductIdInput.value;

    let imageDataToSave = currentProductImageData; // Start with existing image data

    const file = editProductImageInput.files[0];
    if (file) {
        // If a new file is selected, convert it to base64
        try {
            imageDataToSave = await getImageBase64(file);
        } catch (error) {
            console.error('Error converting image to base64:', error);
            showDashboardMessage('Failed to process image. Product not updated.', 'error');
            return;
        }
    } else if (editProductImageInput.value === '' && currentProductImageData !== '') {
        // If file input is cleared but there was an existing image, user wants to remove it
        imageDataToSave = '';
    }
    // If no new file and no existing image, imageDataToSave remains ''

    const updatedProduct = {
        name: editProductNameInput.value,
        price: parseFloat(editProductPriceInput.value),
        category: editProductCategoryInput.value,
        description: editProductDescriptionInput.value,
        imageData: imageDataToSave, // Use the new or existing image data
    };

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProduct),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Update failed.');
        }

        showDashboardMessage('Product updated successfully!', 'success');
        closeModal('editProductModal');
        fetchAndDisplayProducts(); // Refresh the product table
    } catch (error) {
        console.error('Error updating product:', error);
        showDashboardMessage(`Failed to update product: ${error.message}`, 'error');
    }
});

// Helper function to convert file to Base64
function getImageBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}