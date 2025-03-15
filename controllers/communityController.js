const apiClient = require("../config/mattermost");

exports.createCommunity = async (req, res) => {
  try {
    const { name, display_name, type } = req.body; // type: "O" (open) or "P" (private)
    
    const response = await apiClient.post("/teams", {
      name,
      display_name,
      type,
    });

    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error creating community", error: error.response.data });
  }
};




//add user to community

exports.addUserToCommunity = async (req, res) => {
    try {
      const { team_id, user_id } = req.body;
  
      await apiClient.post(`/teams/${team_id}/members`, { team_id, user_id });
  
      res.status(200).json({ message: "User added successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error adding user", error: error.response.data });
    }
  };

  
  //assign roles to users
  exports.assignRole = async (req, res) => {
    try {
      const { team_id, user_id, roles } = req.body; // roles: "team_admin", "team_user", etc.
  
      await apiClient.put(`/teams/${team_id}/members/${user_id}/roles`, { roles });
  
      res.status(200).json({ message: "Role updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error assigning role", error: error.response.data });
    }
  };

  
  //