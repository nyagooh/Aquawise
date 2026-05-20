from rest_framework.views import APIView
from rest_framework.response import Response


class MeView(APIView):
    def get(self, request):
        user = request.user
        org = user.organisation
        return Response({
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "organisation": {
                "id": str(org.id),
                "name": org.name,
                "slug": org.slug,
            } if org else None,
        })
