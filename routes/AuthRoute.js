export const getDashboard = async (req, res) => {
    const user = req.user;
  
    res.status(200).json({
      success: true,
      message: Welcome, ${user.full_name}!,
      data: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        memberSince: user.createdAt,
      },
    });
  };