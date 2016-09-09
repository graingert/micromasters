"""
Tests for HTTP email API views
"""
from unittest.mock import Mock, patch
from django.core.urlresolvers import reverse
from django.db.models.signals import post_save
from rest_framework.test import APITestCase
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
)
from factory.django import mute_signals

from profiles.factories import ProfileFactory
from courses.factories import ProgramFactory
from roles.models import Role
from roles.roles import Staff


@patch('mail.views.prepare_and_execute_search')  # pylint: disable=missing-docstring
@patch('mail.views.MailgunClient')  # pylint: disable=missing-docstring
class MailViewsTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.mail_url = reverse('mail_api')
        cls.program = ProgramFactory.create(live=True)
        # create a user with a role for one program
        with mute_signals(post_save):
            staff_profile = ProfileFactory.create()
            cls.staff = staff_profile.user
        Role.objects.create(
            user=cls.staff,
            program=cls.program,
            role=Staff.ROLE_ID
        )
        cls.request_data = {
            'search_request': {},
            'email_subject': 'email subject',
            'email_body': 'email body'
        }

    def setUp(self):
        super(MailViewsTests, self).setUp()
        self.client.force_login(self.staff)

    def test_send_view(self, mock_mailgun_client, mock_prepare_exec_search):
        """
        Test that the email send view will accept and return expected values
        """
        email_results = ['a@example.com', 'b@example.com']
        mock_prepare_exec_search.return_value = email_results
        mock_mailgun_client.send_bcc.return_value = Mock(spec=Response, status_code=HTTP_200_OK)
        resp_post = self.client.post(self.mail_url, data=self.request_data, format='json')
        assert resp_post.status_code == HTTP_200_OK
        assert mock_prepare_exec_search.called
        assert mock_mailgun_client.send_bcc.called
        called_args, _ = mock_mailgun_client.send_bcc.call_args
        called_args = list(called_args)
        assert called_args[0] == self.request_data['email_subject']
        assert called_args[1] == self.request_data['email_body']
        assert called_args[2] == ','.join(email_results)

    def test_mailgun_status_returned(self, mock_mailgun_client, mock_prepare_exec_search):
        """
        Test that the status code from Mailgun's API response will be returned in our own
         response
        """
        mock_prepare_exec_search.return_value = []
        mock_mailgun_client.send_bcc.return_value = Mock(spec=Response, status_code=HTTP_400_BAD_REQUEST)
        resp_post = self.client.post(self.mail_url, data=self.request_data, format='json')
        assert resp_post.status_code == HTTP_400_BAD_REQUEST

    def test_no_program_user_response(self, *args):  # pylint: disable=unused-argument
        """
        Test that a 403 will be returned when a user with inadequate permissions attempts
        to send an email through the email send view
        """
        with mute_signals(post_save):
            no_permissions_profile = ProfileFactory.create()
        self.client.force_login(no_permissions_profile.user)
        resp_post = self.client.post(self.mail_url, data=self.request_data, format='json')
        assert resp_post.status_code == HTTP_403_FORBIDDEN
