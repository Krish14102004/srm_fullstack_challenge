const { processHierarchyData } = require('../services/hierarchyService');

const handleBfhl = (req, res) => {
  try {
    const result = processHierarchyData(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      error: true,
      message: error.message || 'Something went wrong',
    });
  }
};

module.exports = { handleBfhl };