require('dotenv').config();
const mongoose = require('mongoose');
const prompt = require('prompt-sync')({ sigint: true });

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define the Customer schema and model
const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: String, required: true },
});

const Customer = mongoose.model('Customer', customerSchema);

// Helper functions for menu actions
async function createCustomer() {
    const name = prompt('Enter customer name: ');
    const age = prompt('Enter customer age: ');

    const newCustomer = new Customer({ name, age });

    try {
        await newCustomer.save();
        console.log(`Customer "${name}" added successfully!\n`);
    } catch (err) {
        console.error('Error adding customer:', err.message, '\n');
    }
}

async function viewCustomers() {
    try {
        const customers = await Customer.find();
        if (customers.length === 0) {
            console.log('No customers found.\n');
        } else {
            console.log('Customer List:');
            customers.forEach((customer, index) => {
                console.log(`${index + 1}. Name: ${customer.name}, Age: ${customer.age}`);
            });
            console.log();
        }
    } catch (err) {
        console.error('Error retrieving customers:', err.message, '\n');
    }
}

async function updateCustomer() {
    const name = prompt('Enter the name of the customer to update: ');
    try {
        const customer = await Customer.findOne({name});
        if (!customer) {
            console.log('Customer not found.\n');
            return;
        }

        const name = prompt(`Enter new name (${customer.name}): `) || customer.name;
        const age = prompt(`Enter new age (${customer.age}): `) || customer.age;

        customer.name = name;
        customer.age = age;
        await customer.save();

        console.log('Customer updated successfully!\n');
    } catch (err) {
        console.error('Error updating customer:', err.message, '\n');
    }
}

async function deleteCustomer() {
    const name = prompt('Enter the name of the customer to delete: ');
    try {
        const result = await Customer.deleteOne({ name });
        if (result.deletedCount === 0) {
            console.log('Customer not found.\n');
        } else {
            console.log('Customer deleted successfully!\n');
        }
    } catch (err) {
        console.error('Error deleting customer:', err.message, '\n');
    }
}

// Menu system
(async function mainMenu() {
    let isRunning = true;

    while (isRunning) {
        console.log('===== Customer Relationship Management (CRM) Menu =====');
        console.log('1. Create Customer');
        console.log('2. View Customers');
        console.log('3. Update Customer');
        console.log('4. Delete Customer');
        console.log('5. Quit');
        const choice = prompt('Enter your choice (1-5): ');

        switch (choice) {
            case '1':
                await createCustomer();
                break;
            case '2':
                await viewCustomers();
                break;
            case '3':
                await updateCustomer();
                break;
            case '4':
                await deleteCustomer();
                break;
            case '5':
                console.log('Exiting the program. Goodbye!');
                isRunning = false;
                mongoose.connection.close();
                break;
            default:
                console.log('Invalid choice. Please try again.\n');
        }
    }
})();
