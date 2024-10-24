const validateClient = (req, res, next) => {
    const { 
        ubi, firstName, lastName, dateOfBirth, 
        gender, email, accountList, nationality 
    } = req.body;

    if (!ubi || !firstName || !lastName || !dateOfBirth || 
        !gender || !email || !accountList || !nationality) {
        return res.status(400).json({
            success: false,
            message: 'Tous les champs obligatoires doivent être remplis'
        });
    }

    // Validation du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Format d\'email invalide'
        });
    }

    // Validation des listes
    try {
        if (!Array.isArray(accountList)) {
            throw new Error('accountList doit être un tableau');
        }
        if (!Array.isArray(nationality)) {
            throw new Error('nationality doit être un tableau');
        }
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    next();
};

module.exports = { validateClient };