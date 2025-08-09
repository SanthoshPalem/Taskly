import React, { useState, useEffect } from 'react';
// Ant Design Components
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  List, 
  Typography, 
  Divider, 
  Button, 
  Space, 
  Spin, 
  Empty, 
  Progress,
  Tag,
  Badge,
  Avatar
} from 'antd';

// Icons
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  TeamOutlined, 
  UserOutlined, 
  CheckOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';

import { getMyAssignedTasks, getAllGroupTasks } from '../Services/TasksServices';
import { getMyGroups } from '../Services/GroupServices';
import { Pie } from '@ant-design/plots';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [assignedTasks, setAssignedTasks] = useState({});
  const [groups, setGroups] = useState([]);
  const [groupTasks, setGroupTasks] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    totalGroups: 0,
    totalMembers: 0,
  });
  const navigate = useNavigate();
  
  // Get current user ID from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  // Fetch group tasks data for all groups with group information
  const fetchGroupTasks = async (groupIds, allGroups) => {
    try {
      const allTasks = [];
      for (const groupId of groupIds) {
        const group = allGroups.find(g => g._id === groupId);
        if (group) {
          const tasks = await getAllGroupTasks(groupId);
          // Add group information to each task
          const tasksWithGroup = tasks.map(task => ({
            ...task,
            group: {
              _id: group._id,
              name: group.name
            }
          }));
          allTasks.push(...tasksWithGroup);
        }
      }
      setGroupTasks(allTasks);
      return allTasks;
    } catch (error) {
      console.error('Error fetching group tasks:', error);
      return [];
    }
  };

  // Process group tasks data for pie chart
  const processGroupTasksData = (tasks) => {
    const statusCount = {
      completed: 0,
      pending: 0,
      overdue: 0
    };
    
    const now = new Date();
    
    tasks.forEach(task => {
      if (task.status === 'completed') {
        statusCount.completed++;
      } else if (new Date(task.dueDate) < now) {
        statusCount.overdue++;
      } else {
        statusCount.pending++;
      }
    });
    
    return [
      { type: 'Completed', value: statusCount.completed },
      { type: 'Pending', value: statusCount.pending },
      { type: 'Overdue', value: statusCount.overdue },
    ];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assignedTasksData, groupsData] = await Promise.all([
          getMyAssignedTasks(),
          getMyGroups()
        ]);
        
        // Process assigned tasks
        const now = new Date();
        const completedAssignedTasks = assignedTasksData.filter(task => task.status === 'completed');
        const pendingAssignedTasks = assignedTasksData.filter(task => task.status !== 'completed');
        const overdueAssignedTasks = pendingAssignedTasks.filter(task => new Date(task.dueDate) < now);
        
        // Process groups data
        const allGroups = Array.isArray(groupsData) ? groupsData : [];
        const totalMembers = allGroups.reduce((sum, group) => {
          return sum + (group.members?.length || 0);
        }, 0);
        
        // Fetch and process group tasks if there are groups
        let allGroupTasks = [];
        if (allGroups.length > 0) {
          const groupIds = allGroups.map(group => group._id);
          allGroupTasks = await fetchGroupTasks(groupIds, allGroups);
        }
        
        // Process all group tasks for stats
        const completedTasks = allGroupTasks.filter(task => task.status === 'completed');
        const pendingTasks = allGroupTasks.filter(task => task.status !== 'completed');
        const overdueTasks = allGroupTasks.filter(task => 
          task.status !== 'completed' && new Date(task.dueDate) < now
        );
        
        // Set assigned tasks state
        setAssignedTasks({
          all: assignedTasksData,
          completed: completedAssignedTasks,
          pending: pendingAssignedTasks.filter(t => new Date(t.dueDate) >= now),
          overdue: overdueAssignedTasks
        });
        
        setGroups(allGroups);
        setGroupTasks(allGroupTasks);
        setStats({
          totalTasks: allGroupTasks.length,
          completedTasks: completedTasks.length,
          pendingTasks: pendingTasks.length - overdueTasks.length, // Only count non-overdue pending
          overdueTasks: overdueTasks.length,
          totalGroups: allGroups.length,
          totalMembers
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low':
      default: return 'green';
    }
  };
  
  const getTaskStatus = (task) => {
    if (task.status === 'completed') return 'success';
    if (new Date(task.dueDate) < new Date()) return 'exception';
    return 'active';
  };
  
  const getTaskStatusText = (task) => {
    if (task.status === 'completed') return 'Completed';
    if (new Date(task.dueDate) < new Date()) return 'Overdue';
    return 'In Progress';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ padding: '20px' }}>
      {/* <Title level={2} className="dashboard-title" style={{ marginBottom: '24px' }}>Dashboard Overview</Title> */}
      
      {/* My Assigned Tasks */}
      <Card 
        title={
          <Space>
            <UserOutlined style={{ color: '#722ed1' }} />
            <span style={{ fontSize: '18px', fontWeight: '500' }}>My Assigned Tasks</span>
          </Space>
        }
        style={{ 
          margin: '24px 0',
          borderLeft: '4px solid #722ed1',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
        headStyle={{ borderBottom: '1px solid #f0f0f0' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card style={{ background: '#f9f0ff', border: 'none' }}>
              <Statistic
                title="Total Assigned"
                value={assignedTasks.all?.length || 0}
                valueStyle={{ color: '#722ed1' }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={{ background: '#f6ffed', border: 'none' }}>
              <Statistic
                title="Completed"
                value={assignedTasks.completed?.length || 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={{ background: '#fff7e6', border: 'none' }}>
              <Statistic
                title="Pending"
                value={assignedTasks.pending?.length || 0}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={{ background: '#fff1f0', border: 'none' }}>
              <Statistic
                title="Overdue"
                value={assignedTasks.overdue?.length || 0}
                valueStyle={{ color: '#f5222d' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Group Task Metrics */}
     
      
      {/* Group Metrics Section */}
      <Card 
        style={{ 
          marginTop: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={4} style={{ margin: 0 }}>Group Metrics</Title>
        </div>
        
        {/* Summary Row */}
        <Row gutter={[16, 16]} style={{ padding: '16px 24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic
                title="Total Groups"
                value={stats.totalGroups}
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic
                title="Total Tasks"
                value={stats.totalTasks}
                prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic
                title="Completed Tasks"
                value={stats.completedTasks}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic
                title="In Progress"
                value={stats.pendingTasks}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ fontSize: '24px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tasks by Status */}
        <Row gutter={[16, 16]} style={{ padding: '0 24px 24px' }}>
          {/* Completed Tasks */}
          <Col xs={24} md={12}>
            <Card 
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>Completed Tasks</span>
                </Space>
              }
              style={{ height: '100%' }}
            >
              {groupTasks.filter(t => t.status === 'completed').length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                  <List
                    dataSource={groupTasks
                      .filter(t => t.status === 'completed')
                      .sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt))
                    }
                    renderItem={task => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Space>
                              <Text ellipsis style={{ maxWidth: '200px' }}>
                                {task.title}
                              </Text>
                              <Tag color="green">Completed</Tag>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={0}>
                              {task.group?.name ? (
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  <TeamOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                                  {task.group.name}
                                </Text>
                              ) : (
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  <TeamOutlined style={{ marginRight: 4, color: '#bfbfbf' }} />
                                  No Group
                                </Text>
                              )}
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                <CalendarOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              ) : (
                <div style={{ padding: '16px 0' }}>
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="No completed tasks"
                  />
                </div>
              )}
            </Card>
          </Col>

          {/* In Progress/Not Completed Tasks */}
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#faad14' }} />
                  <span>In Progress</span>
                </Space>
              }
              style={{ height: '100%' }}
            >
              {groupTasks.filter(t => t.status !== 'completed').length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                  <List
                    dataSource={groupTasks
                      .filter(t => t.status !== 'completed')
                      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    }
                    renderItem={task => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Space>
                              <Text ellipsis style={{ maxWidth: '200px' }}>
                                {task.title}
                              </Text>
                              <Tag color={new Date(task.dueDate) < new Date() ? 'red' : 'orange'}>
                                {new Date(task.dueDate) < new Date() ? 'Overdue' : 'In Progress'}
                              </Tag>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={0}>
                              {task.group?.name ? (
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  <TeamOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                                  {task.group.name}
                                </Text>
                              ) : (
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  <TeamOutlined style={{ marginRight: 4, color: '#bfbfbf' }} />
                                  No Group
                                </Text>
                              )}
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                <CalendarOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              ) : (
                <div style={{ padding: '16px 0' }}>
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="No tasks in progress"
                  />
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Card>
      
     
    </div>
  );
};

export default Dashboard;