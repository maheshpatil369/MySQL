import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreVertical,
  UserPlus,
  Settings,
  Crown,
  Shield,
  User,
  Trash2 // Import Trash2 icon for delete
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import defaultAvatar from '../components/images/default-avatar-icon-of-social-media-user-vector.jpg'; // Import default avatar

const Team = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'Leader', // Changed from admin
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150',
      age: 28,
      location: 'San Francisco', // Changed to city name
      joinedAt: '2023-01-15',
      tripsCount: 12,
      status: 'online',
      bio: 'Adventure seeker and travel photographer. Love exploring hidden gems around the world.',
      phone: '+1 (555) 123-4567',
      interests: ['Photography', 'Hiking', 'Food']
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      role: 'member',
      avatar: 'https://images.pexels.com/photos/3777931/pexels-photo-3777931.jpeg?auto=compress&cs=tinysrgb&w=150',
      age: 32,
      location: 'New York', // Changed to city name
      joinedAt: '2023-02-20',
      tripsCount: 8,
      status: 'online',
      bio: 'Tech enthusiast who loves combining work and travel. Always looking for the next adventure.',
      phone: '+1 (555) 234-5678',
      interests: ['Technology', 'Culture', 'Museums']
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      role: 'member',
      avatar: 'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg?auto=compress&cs=tinysrgb&w=150',
      age: 26,
      location: 'Austin', // Changed to city name
      joinedAt: '2023-03-10',
      tripsCount: 15,
      status: 'away',
      bio: 'Foodie and culture enthusiast. I plan the best restaurant stops for our trips!',
      phone: '+1 (555) 345-6789',
      interests: ['Food', 'Art', 'Music']
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@email.com',
      role: 'member',
      avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150',
      age: 30,
      location: 'Seattle', // Changed to city name
      joinedAt: '2023-04-05',
      tripsCount: 6,
      status: 'offline',
      bio: 'Outdoor enthusiast and budget travel expert. Let\'s explore the world without breaking the bank!',
      phone: '+1 (555) 456-7890',
      interests: ['Hiking', 'Budget Travel', 'Nature']
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      email: 'lisa.thompson@email.com',
      role: 'member',
      avatar: 'https://images.pexels.com/photos/3823489/pexels-photo-3823489.jpeg?auto=compress&cs=tinysrgb&w=150',
      age: 29,
      location: 'Miami', // Changed to city name
      joinedAt: '2023-05-12',
      tripsCount: 10,
      status: 'online',
      bio: 'Beach lover and wellness traveler. I know all the best spa retreats and relaxation spots.',
      phone: '+1 (555) 567-8901',
      interests: ['Wellness', 'Beaches', 'Yoga']
    }
  ]);

  // State for the new member form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAge, setNewMemberAge] = useState('');
  const [newMemberMobile, setNewMemberMobile] = useState('');
  const [newMemberLocationCity, setNewMemberLocationCity] = useState('');
  const [newMemberComments, setNewMemberComments] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName || !newMemberAge || !newMemberMobile || !newMemberLocationCity || !newMemberEmail) {
      alert("Please fill in all required fields: Name, Age, Mobile, Location (City), and Email.");
      return;
    }
    const newMember = {
      id: teamMembers.length > 0 ? Math.max(...teamMembers.map(m => m.id)) + 1 : 1,
      name: newMemberName,
      age: parseInt(newMemberAge),
      phone: newMemberMobile,
      location: newMemberLocationCity,
      email: newMemberEmail,
      role: newMemberRole,
      avatar: defaultAvatar, // Use imported default avatar
      joinedAt: new Date().toISOString().split('T')[0],
      tripsCount: 0,
      status: 'offline',
      bio: newMemberComments || 'Newly added member.', // Use comments for bio
      interests: []
    };
    setTeamMembers(prevMembers => [...prevMembers, newMember]);
    console.log("New Member Added:", newMember);
    // Reset form and close modal
    setNewMemberName('');
    setNewMemberAge('');
    setNewMemberMobile('');
    setNewMemberLocationCity('');
    setNewMemberComments('');
    setNewMemberEmail('');
    setNewMemberRole('member');
    setShowAddMemberModal(false);
  };

  const handleDeleteMember = (memberId) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      setTeamMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
      console.log("Member deleted:", memberId);
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.location && member.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Leader': return Crown; // Changed from admin
      case 'moderator': return Shield;
      default: return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Leader': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'; // Changed from admin
      case 'moderator': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Members</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your travel team and collaborate on trips
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddMemberModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Member
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            { label: 'Total Members', value: teamMembers.length, color: 'bg-blue-500' },
            { label: 'Online Now', value: teamMembers.filter(m => m.status === 'online').length, color: 'bg-green-500' },
            { label: 'Active Trips', value: '3', color: 'bg-purple-500' }, // Placeholder
            { label: 'Avg Age', value: teamMembers.length > 0 ? Math.round(teamMembers.reduce((sum, m) => sum + m.age, 0) / teamMembers.length) : 0, color: 'bg-orange-500' }
          ].map((stat, index) => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </motion.div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member, index) => {
            const RoleIcon = getRoleIcon(member.role);
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white dark:border-gray-800`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {member.role}
                          </span>
                          <span className="text-sm text-gray-500">Age {member.age}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{member.bio}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4 mr-2" />
                      {member.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4 mr-2" />
                      {member.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      {member.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {member.interests.map((interest) => (
                      <span key={interest} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">{member.tripsCount}</span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">trips</span>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Message
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Profile
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-700/20 rounded-lg transition-colors"
                        title="Delete Member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddMemberModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Add New Team Member
              </h3>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label htmlFor="newMemberName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input type="text" id="newMemberName" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="newMemberAge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                    <input type="number" id="newMemberAge" value={newMemberAge} onChange={(e) => setNewMemberAge(e.target.value)} required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700" />
                  </div>
                  <div>
                    <label htmlFor="newMemberMobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                    <input type="tel" id="newMemberMobile" value={newMemberMobile} onChange={(e) => setNewMemberMobile(e.target.value)} required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700" />
                  </div>
                </div>
                <div>
                  <label htmlFor="newMemberLocationCity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location (City Name)</label>
                  <input type="text" id="newMemberLocationCity" value={newMemberLocationCity} onChange={(e) => setNewMemberLocationCity(e.target.value)} required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700" />
                </div>
                 <div>
                  <label htmlFor="newMemberEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input type="email" id="newMemberEmail" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700" />
                </div>
                <div>
                  <label htmlFor="newMemberRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select id="newMemberRole" value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700">
                    <option value="member">Member</option>
                    <option value="Leader">Leader</option> {/* Changed from Admin */}
                  </select>
                </div>
                <div>
                  <label htmlFor="newMemberComments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comments/Notes</label>
                  <textarea id="newMemberComments" value={newMemberComments} onChange={(e) => setNewMemberComments(e.target.value)} rows={3}
                    placeholder="Any notes about this member..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700" />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add Member
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Team;