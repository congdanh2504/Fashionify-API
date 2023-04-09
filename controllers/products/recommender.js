const productModel = require("../../models/product")
const natural = require('natural');
const cosine = require('cosine-similarity');

const tfidf = new natural.TfIdf();

const cosSim = [];
let products = [];

const trainModel = async () => {
    products = await productModel.find({}).populate("category")

    products.forEach(product => tfidf.addDocument(product.title + ' ' + product.category.title));
    const vectors = [];
    products.forEach((product, i) => {
        const vector = [];
        tfidf.listTerms(i).forEach(term => {
        vector.push(term.tfidf);
        });
        vectors.push(vector);
    });

    
    for (let i = 0; i < vectors.length; i++) {
        const row = [];
        for (let j = 0; j < vectors.length; j++) {
        row.push(cosine(vectors[i], vectors[j]));
        }
        cosSim.push(row);
    }
}

trainModel();

module.exports.getRecommendations = (historyProducts) => {
    const indices = historyProducts.map(product => {
        const index = products.findIndex(p => p.title === product.title && p.price === product.price);
        return index;
    });

    const simScores = cosSim[indices[0]].map((score, j) => {
        const values = indices.map(i => cosSim[i][j]);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return avg;
    });

    // Sort the products based on the cosine similarity scores
    const sortedIndices = simScores.map((score, i) => [i, score]).sort((a, b) => b[1] - a[1]);

    // Get the indices of the 10 most similar products
    const productIndices = sortedIndices.slice(0, 10).map(index => index[0]);

    // Return the top 10 most similar products
    return products.filter((product, index) => productIndices.includes(index));
}
