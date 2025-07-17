// Test controller to isolate the problem
exports.testRegister = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Test controller working',
      body: req.body
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Test controller error: ' + error.message
    });
  }
};