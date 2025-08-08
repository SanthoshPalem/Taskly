import React, { useState, useEffect } from 'react';
// Ant Design Components
import Card from 'antd/es/card';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import Statistic from 'antd/es/statistic';
import List from 'antd/es/list';
import Typography from 'antd/es/typography';
import Divider from 'antd/es/divider';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Spin from 'antd/es/spin';
import Empty from 'antd/es/empty';

// Icons
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { getMyAssignedTasks } from '../Services/TasksServices';
import { getMyGroups } from '../Services/GroupServices';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksData, groupsData] = await Promise.all([
          getMyAssignedTasks(),
          getMyGroups()
        ]);
        
        // Process tasks
        const completedTasks = tasksData.filter(task => task.status === 'completed').length;
        const pendingTasks = tasksData.filter(task => task.status !== 'completed').length;
        
        setTasks(tasksData.slice(0, 5)); // Show only 5 most recent tasks
        setGroups(groupsData.createdGroups.concat(groupsData.memberGroups).slice(0, 3)); // Show 3 most recent groups
        setStats({
          totalTasks: tasksData.length,
          completedTasks,
          pendingTasks,
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
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low':
      default: return '#52c41a';
    }
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
      <Title level={2} className="dashboard-title" style={{ marginBottom: '24px' }}>Dashboard Overview</Title>
      
      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={8}>
          <Card className="stat-card">
            <Statistic
              title="Total Tasks"
              value={stats.totalTasks}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="stat-card">
            <Statistic
              title="Completed"
              value={stats.completedTasks}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="stat-card">
            <Statistic
              title="Pending"
              value={stats.pendingTasks}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="content-row">
        {/* Recent Tasks */}
        <Col xs={24} lg={16}>
          <Card 
            title="Recent Tasks" 
            extra={
              <Button type="link" onClick={() => navigate('mytasks')}>
                View All
              </Button>
            }
            className="dashboard-card"
          >
            {tasks.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={tasks}
                renderItem={(task) => (
                  <List.Item 
                    className="task-item"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <CheckCircleOutlined 
                            style={{ 
                              color: task.status === 'completed' ? '#52c41a' : '#d9d9d9',
                              fontSize: '16px' 
                            }} 
                          />
                          <Text 
                            style={{ 
                              textDecoration: task.status === 'completed' ? 'line-through' : 'none' 
                            }}
                          >
                            {task.title}
                          </Text>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" ellipsis>
                            {task.description || 'No description'}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </Text>
                        </Space>
                      }
                    />
                    <div className="task-tag" style={{ 
                      backgroundColor: getPriorityColor(task.priority) + '1a',
                      color: getPriorityColor(task.priority),
                      borderColor: getPriorityColor(task.priority)
                    }}>
                      {task.priority || 'Low'}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="No tasks found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>

        {/* My Groups */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <TeamOutlined />
                <span>My Groups</span>
              </Space>
            }
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                size="small"
                onClick={() => navigate('/groups/create')}
              >
                New
              </Button>
            }
            className="dashboard-card"
          >
            {groups.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={groups}
                renderItem={(group) => (
                  <List.Item 
                    className="group-item"
                    onClick={() => navigate(`/groups/${group._id}`)}
                  >
                    <List.Item.Meta
                      title={group.name}
                      description={`${group.members?.length || 0} members`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description={
                  <div>
                    <p>You're not in any groups yet</p>
                    <Button 
                      type="primary" 
                      onClick={() => navigate('/groups/create')}
                    >
                      Create a Group
                    </Button>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>

          {/* Quick Actions */}
          <Card 
            title="Quick Actions" 
            className="dashboard-card quick-actions"
            style={{ marginTop: '16px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                block 
                type="primary" 
                onClick={() => navigate('/tasks/create')}
              >
                Create New Task
              </Button>
              <Button 
                block 
                onClick={() => navigate('/groups')}
              >
                View All Groups
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;