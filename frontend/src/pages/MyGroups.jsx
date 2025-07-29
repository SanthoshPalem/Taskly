import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import GroupForm from '../components/GroupForm';
import { useState } from 'react';

const groupData = [
  {
    name: 'Project Alpha',
    tasks: 12,
    members: 4
  },
  {
    name: 'Team Rocket',
    tasks: 5,
    members: 3
  },
  {
    name: 'Code Masters',
    tasks: 8,
    members: 6
  },
  {
    name: 'Bug Busters',
    tasks: 10,
    members: 5
  },
  {
    name: 'Debuggers United',
    tasks: 3,
    members: 2
  },
  {
    name: 'Frontend Ninjas',
    tasks: 7,
    members: 4
  }
];

export default function MyGroups() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const navigate = useNavigate()

  const filteredGroups = groupData.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [openForm, setOpenForm] = useState(false);

  const handleToggle = () => setOpenForm(prev => !prev); // Toggle form


  return (
    <Box sx={{ position: 'relative', p: 2 }}>
      {/* Search Bar */}
      <Paper
        component="form"
        sx={{
          p: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          width: { xs: '100%', sm: 300 },
          mb: 3
        }}
        elevation={2}
      >
        <SearchIcon sx={{ mr: 1 }} />
        <InputBase
          sx={{ flex: 1 }}
          placeholder="Search Groups"
          inputProps={{ 'aria-label': 'search groups' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Paper>

      {/* Group Cards */}
      <Grid container spacing={2}>
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{group.name}</Typography>
                  <Typography color="text.secondary">Tasks: {group.tasks}</Typography>
                  <Typography color="text.secondary">Members: {group.members}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">View</Button>
                  <Button size="small">Edit</Button>
                  <Button size="small" color="error">Delete</Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography sx={{ m: 2, color: 'text.secondary' }}>No groups found.</Typography>
        )}
      </Grid>

      {/* Floating Action Button */}
      <Tooltip title="Add Group" placement="top">
        <Fab
          color="secondary"
          aria-label="add"
          onClick={handleToggle}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

     <GroupForm open={openForm} handleClose={handleToggle} />

    </Box>
  );
}
